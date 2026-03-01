'use client'

import { useState, useEffect } from 'react'
import { Menu, ChevronRight } from 'lucide-react'
import { HeroBanner } from '@/components/movie/HeroBanner'
import { MovieCard } from '@/components/movie/MovieCard'
import { SeriesCard } from '@/components/movie/SeriesCard'
import { Button } from '@/components/ui/button'
import { useAppStore, Movie } from '@/store'

interface HomeViewProps {
  onMenuClick: () => void
  onMovieClick: (movie: Movie) => void
}

export function HomeView({ onMenuClick, onMovieClick }: HomeViewProps) {
  const { settings, setCurrentPage } = useAppStore()
  const [movies, setMovies] = useState<Movie[]>([])
  const [series, setSeries] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [moviesRes, seriesRes] = await Promise.all([
        fetch('/api/movies?type=movies'),
        fetch('/api/movies?type=series'),
      ])
      
      if (moviesRes.ok) {
        const moviesData = await moviesRes.json()
        setMovies(moviesData)
      }
      
      if (seriesRes.ok) {
        const seriesData = await seriesRes.json()
        setSeries(seriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const featuredMovies = [...movies, ...series].filter(m => m.isFeatured)
  const iconicMovies = [...movies, ...series].filter(m => m.isIconic)
  const trendingMovies = [...movies, ...series].filter(m => m.isTrending)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onMenuClick} className="p-2 -ml-2">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-primary">
            {settings?.headerText || 'BurmaYoteShin'}
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Hero Banner */}
      <HeroBanner movies={featuredMovies} onMovieClick={onMovieClick} />

      {/* Iconic Movies Section */}
      {iconicMovies.length > 0 && (
        <section className="mt-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Iconic Movies</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => setCurrentPage('movies')}
            >
              See all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {iconicMovies.slice(0, 6).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => onMovieClick(movie)}
                size="sm"
              />
            ))}
          </div>
        </section>
      )}

      {/* Trending Now Section */}
      {trendingMovies.length > 0 && (
        <section className="mt-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Trending Now</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => setCurrentPage('movies')}
            >
              See all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {trendingMovies.slice(0, 10).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => onMovieClick(movie)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Popular Series Section */}
      {series.length > 0 && (
        <section className="mt-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Popular Series</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => setCurrentPage('series')}
            >
              See all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {series.slice(0, 10).map((s) => (
              <SeriesCard
                key={s.id}
                series={s}
                onClick={() => onMovieClick(s)}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Movies Section */}
      {movies.length > 0 && (
        <section className="mt-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">All Movies</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => setCurrentPage('movies')}
            >
              See all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {movies.slice(0, 6).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => onMovieClick(movie)}
                size="sm"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
