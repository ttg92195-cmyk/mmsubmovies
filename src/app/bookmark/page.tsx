'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bookmark } from 'lucide-react'
import { useAppStore, Movie } from '@/store'
import { MovieCard } from '@/components/movie/MovieCard'
import { SeriesCard } from '@/components/movie/SeriesCard'
import { BottomNav } from '@/components/movie/BottomNav'

export default function BookmarkPage() {
  const { bookmarkIds } = useAppStore()
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (bookmarkIds.length === 0) {
        setMovies([])
        setLoading(false)
        return
      }
      
      try {
        const res = await fetch('/api/movies')
        const data = await res.json()
        if (data.success && data.data) {
          const bookmarkedMovies = data.data.filter((m: Movie) => bookmarkIds.includes(m.id))
          setMovies(bookmarkedMovies)
        }
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookmarks()
  }, [bookmarkIds])

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
          <h1 className="text-xl font-bold text-white">Bookmarks</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-3">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {movies.map(movie => (
              movie.isSeries ? (
                <SeriesCard key={movie.id} series={movie} showGenre />
              ) : (
                <MovieCard key={movie.id} movie={movie} showGenre />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No bookmarks yet</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
