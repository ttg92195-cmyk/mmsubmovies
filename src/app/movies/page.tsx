'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Filter, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore, Movie } from '@/store'
import { MovieCard } from '@/components/movie/MovieCard'
import { BottomNav } from '@/components/movie/BottomNav'

// Sample fallback data for Vercel deployment
const SAMPLE_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    rating: 9.0,
    year: 2008,
    duration: 152,
    genre: 'Action, Crime, Drama',
    language: 'en',
    isSeries: false,
    isFeatured: false,
    isTrending: true,
    isIconic: true,
    cast: [],
    downloadLinks: []
  },
  {
    id: '2',
    title: 'Inception',
    overview: 'Cobb, a skilled thief who commits corporate espionage.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep9B1QDKYHz.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    rating: 8.8,
    year: 2010,
    duration: 148,
    genre: 'Action, Science Fiction, Adventure',
    language: 'en',
    isSeries: false,
    isFeatured: false,
    isTrending: true,
    isIconic: true,
    cast: [],
    downloadLinks: []
  },
  {
    id: '3',
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    rating: 8.7,
    year: 2014,
    duration: 169,
    genre: 'Adventure, Drama, Science Fiction',
    language: 'en',
    isSeries: false,
    isFeatured: false,
    isTrending: false,
    isIconic: true,
    cast: [],
    downloadLinks: []
  },
  {
    id: '7',
    title: 'Avatar',
    overview: 'A paraplegic Marine is dispatched to the moon Pandora.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosbbVrny.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    rating: 7.6,
    year: 2009,
    duration: 162,
    genre: 'Action, Adventure, Fantasy',
    language: 'en',
    isSeries: false,
    isFeatured: false,
    isTrending: true,
    isIconic: false,
    cast: [],
    downloadLinks: []
  },
  {
    id: '8',
    title: 'The Prestige',
    overview: 'A mysterious story of two magicians.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/c4z4tBaXfXpTLK0LK6j9A5GX4L.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/9lgyhfNB6jH1Yn8bz6DgE5e5MqG.jpg',
    rating: 8.5,
    year: 2006,
    duration: 130,
    genre: 'Drama, Mystery, Thriller',
    language: 'en',
    isSeries: false,
    isFeatured: false,
    isTrending: false,
    isIconic: true,
    cast: [],
    downloadLinks: []
  },
]

export default function MoviesPage() {
  const { primaryColor, headerText } = useAppStore()
  const [movies, setMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [genreFilter, setGenreFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch movies
  const fetchMovies = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/movies?type=movie', { cache: 'no-store' })
      const data = await res.json()
      if (data.success && data.data && data.data.length > 0) {
        setMovies(data.data.filter((m: Movie) => !m.isSeries))
      } else {
        // Use sample data for Vercel
        setMovies(SAMPLE_MOVIES)
      }
    } catch (error) {
      console.error('Failed to fetch movies:', error)
      // Use sample data on error
      setMovies(SAMPLE_MOVIES)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMovies()
  }, [fetchMovies])

  // Get all genres
  const allGenres = useMemo(() => {
    return [...new Set(movies.flatMap(m => m.genre.split(', ')))].filter(Boolean).sort()
  }, [movies])

  // Filter and sort
  const filteredMovies = useMemo(() => {
    let result = movies

    if (searchQuery) {
      result = result.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (genreFilter !== 'all') {
      result = result.filter(m => m.genre.includes(genreFilter))
    }

    switch (sortBy) {
      case 'newest':
        result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        result = [...result].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating)
        break
      case 'title':
        result = [...result].sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return result
  }, [movies, searchQuery, genreFilter, sortBy])

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
          <h1 className="text-xl font-bold text-white">Movies</h1>
        </div>

        {/* Search and Filter */}
        <div className="px-4 pb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className="pl-10 bg-secondary border-white/10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-secondary border-white/10 flex-1">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="rating">Highest Rating</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>

            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="bg-secondary border-white/10 flex-1">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {allGenres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div 
              className="w-8 h-8 rounded-full animate-spin mx-auto mb-4"
              style={{ border: `2px solid ${primaryColor}`, borderTopColor: 'transparent' }}
            />
            <p className="text-gray-400">Loading movies...</p>
          </div>
        ) : filteredMovies.length > 0 ? (
          <>
            <p className="text-gray-400 text-sm mb-4">
              {filteredMovies.length} movies found
            </p>
            <div className="grid grid-cols-3 gap-3">
              {filteredMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} size="sm" showGenre />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchQuery ? `No movies found for "${searchQuery}"` : 'No movies available'}
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
