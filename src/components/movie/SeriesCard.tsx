'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, Tv } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Movie } from '@/store'

interface SeriesCardProps {
  series: Movie
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showGenre?: boolean
}

export function SeriesCard({ series, size = 'md', showGenre = false }: SeriesCardProps) {
  const seasonCount = series.series?.seasons?.length || 0

  const sizeClasses = {
    xs: 'w-[100px]',
    sm: 'w-[110px]',
    md: 'w-[130px]',
    lg: 'w-[160px]',
  }

  const heightClasses = {
    xs: 'h-[150px]',
    sm: 'h-[165px]',
    md: 'h-[195px]',
    lg: 'h-[240px]',
  }

  const titleSizeClasses = {
    xs: 'text-[11px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm',
  }

  // Format genres with "/" separator
  const genres = series.genre ? series.genre.split(', ').filter(Boolean).slice(0, 2).join(' / ') : ''

  return (
    <Link href={`/series/${series.id}`} className="block">
      <Card className={`${sizeClasses[size]} flex-shrink-0 bg-card border-0 overflow-hidden cursor-pointer transition-transform hover:scale-105 active:scale-95`}>
        <div className={`relative ${heightClasses[size]}`}>
          {series.posterUrl ? (
            <Image
              src={series.posterUrl}
              alt={series.title}
              fill
              className="object-cover"
              sizes={sizeClasses[size]}
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <Tv className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          
          {/* Year Badge */}
          <div className="absolute top-1.5 left-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-white">
            {series.year}
          </div>
          
          {/* Rating Badge */}
          <div className="absolute bottom-1.5 right-1.5 bg-black/70 px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-primary text-primary" />
            <span className="text-[10px] text-white">{series.rating.toFixed(1)}</span>
          </div>

          {/* Season Count Badge */}
          <div className="absolute bottom-1.5 left-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-white">
            S{seasonCount}
          </div>
        </div>
        
        <div className="p-2">
          <p className={`${titleSizeClasses[size]} font-medium truncate text-white`}>{series.title}</p>
          {showGenre && genres && (
            <p className="text-[9px] text-gray-400 truncate mt-0.5">{genres}</p>
          )}
        </div>
      </Card>
    </Link>
  )
}
