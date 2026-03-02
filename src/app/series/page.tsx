'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore, Movie } from '@/store'
import { SeriesCard } from '@/components/movie/SeriesCard'
import { BottomNav } from '@/components/movie/BottomNav'
import { Pagination } from '@/components/movie/Pagination'

const ITEMS_PER_PAGE = 20

// Sample fallback data
const SAMPLE_SERIES: Movie[] = [
  { id: '4', title: 'Breaking Bad', overview: 'When Walter White is diagnosed with cancer.', posterUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', backdropUrl: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg', rating: 9.0, year: 2008, duration: 47, genre: 'Drama, Crime', language: 'en', isSeries: true, isFeatured: false, isTrending: true, isIconic: true, cast: [], downloadLinks: [], series: { id: 's1', status: 'Ended', seasons: [] } },
  { id: '5', title: 'Game of Thrones', overview: 'Seven noble families fight for control.', posterUrl: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', backdropUrl: 'https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg', rating: 8.5, year: 2011, duration: 60, genre: 'Drama, Fantasy, Action', language: 'en', isSeries: true, isFeatured: false, isTrending: true, isIconic: false, cast: [], downloadLinks: [], series: { id: 's2', status: 'Ended', seasons: [] } },
  { id: '6', title: 'Stranger Things', overview: 'When a young boy vanishes.', posterUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', backdropUrl: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg', rating: 8.6, year: 2016, duration: 50, genre: 'Drama, Mystery, Sci-Fi & Fantasy', language: 'en', isSeries: true, isFeatured: false, isTrending: true, isIconic: false, cast: [], downloadLinks: [], series: { id: 's3', status: 'Returning Series', seasons: [] } },
]

export default function SeriesPage() {
  const { primaryColor } = useAppStore()
  const [series, setSeries] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch series
  const fetchSeries = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/movies?type=series&simple=true', { cache: 'no-store' })
      const data = await res.json()
      if (data.success && data.data && data.data.length > 0) {
        setSeries(data.data.filter((m: Movie) => m.isSeries))
      } else {
        setSeries(SAMPLE_SERIES)
      }
    } catch (error) {
      console.error('Failed to fetch series:', error)
      setSeries(SAMPLE_SERIES)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSeries()
  }, [fetchSeries])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy])

  // Filter and sort
  const filteredSeries = useMemo(() => {
    let result = series

    if (searchQuery) {
      result = result.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    switch (sortBy) {
      case 'newest':
        result = [...result].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        break
      case 'oldest':
        result = [...result].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
        break
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating)
        break
      case 'title':
        result = [...result].sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return result
  }, [series, searchQuery, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredSeries.length / ITEMS_PER_PAGE)
  const paginatedSeries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredSeries.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredSeries, currentPage])

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 p-4">
          <Link 
            href="/"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-white">Series</h1>
        </div>

        {/* Search and Filter */}
        <div className="px-4 pb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search series..."
              className="pl-10 bg-secondary border-white/10"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-secondary border-white/10 w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="rating">Highest Rating</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Content */}
      <main className="px-3">
        {isLoading ? (
          <div className="text-center py-12">
            <div 
              className="w-8 h-8 rounded-full animate-spin mx-auto mb-4"
              style={{ border: `2px solid ${primaryColor}`, borderTopColor: 'transparent' }}
            />
            <p className="text-gray-400">Loading series...</p>
          </div>
        ) : filteredSeries.length > 0 ? (
          <>
            <p className="text-gray-400 text-xs mb-3 px-1">
              {filteredSeries.length} series • Page {currentPage} of {totalPages}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {paginatedSeries.map(s => (
                <SeriesCard key={s.id} series={s} showGenre />
              ))}
            </div>
            
            {/* Pagination */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchQuery ? `No series found for "${searchQuery}"` : 'No series available'}
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
