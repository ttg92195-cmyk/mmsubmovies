'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Movie } from '@/store'
import { useAppStore } from '@/store'

interface HeroBannerProps {
  movies: Movie[]
}

export function HeroBanner({ movies }: HeroBannerProps) {
  const { primaryColor } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const featuredMovies = movies.filter(m => m.isFeatured || m.isTrending)
  const currentMovie = featuredMovies[currentIndex]

  useEffect(() => {
    if (featuredMovies.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [featuredMovies.length])

  if (!currentMovie) {
    return (
      <div className="relative h-64 bg-secondary flex items-center justify-center">
        <p className="text-muted-foreground">No featured content</p>
      </div>
    )
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? featuredMovies.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length)
  }

  const detailHref = currentMovie.isSeries ? `/series/${currentMovie.id}` : `/movie/${currentMovie.id}`

  return (
    <div className="relative h-64 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {currentMovie.backdropUrl ? (
          <Image
            src={currentMovie.backdropUrl}
            alt={currentMovie.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized
          />
        ) : currentMovie.posterUrl ? (
          <Image
            src={currentMovie.posterUrl}
            alt={currentMovie.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized
          />
        ) : null}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-4 max-w-lg">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
          {currentMovie.title}
        </h1>
        
        <div className="flex items-center gap-2 mb-2 text-sm">
          <span style={{ color: primaryColor }} className="font-medium">{currentMovie.rating.toFixed(1)} ★</span>
          <span className="text-gray-400">{currentMovie.year}</span>
          {currentMovie.duration && <span className="text-gray-400">{currentMovie.duration} min</span>}
          {currentMovie.isSeries && <span className="text-gray-400">Series</span>}
        </div>
        
        <p className="text-xs md:text-sm text-gray-300 line-clamp-2 mb-3">
          {currentMovie.overview}
        </p>
        
        <div className="flex gap-2">
          <Link href={detailHref}>
            <Button
              className="text-black"
              style={{ backgroundColor: primaryColor }}
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              Watch Now
            </Button>
          </Link>
          <Link href={detailHref}>
            <Button
              variant="secondary"
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <Info className="w-4 h-4 mr-2" />
              Details
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      {featuredMovies.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {featuredMovies.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1">
          {featuredMovies.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-white/50'
              }`}
              style={{ backgroundColor: index === currentIndex ? primaryColor : undefined }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
