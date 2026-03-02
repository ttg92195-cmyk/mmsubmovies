'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, Tv } from 'lucide-react'
import { Movie } from '@/store'

interface SeriesCardProps {
  series: Movie
  showGenre?: boolean
}

export function SeriesCard({ series, showGenre = false }: SeriesCardProps) {
  const seasonCount = series.series?.seasons?.length || 0
  const genres = series.genre ? series.genre.split(', ').filter(Boolean).slice(0, 2).join(' / ') : ''

  return (
    <Link href={`/series/${series.id}`} className="block w-full">
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded overflow-hidden bg-gray-900">
        {series.posterUrl ? (
          <Image
            src={series.posterUrl}
            alt={series.title}
            fill
            className="object-cover"
            sizes="33vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv className="w-8 h-8 text-gray-600" />
          </div>
        )}
        
        {/* Year Badge - Top Left */}
        <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded">
          <span className="text-[10px] text-white font-medium">{series.year}</span>
        </div>
        
        {/* Rating Badge - Top Right */}
        <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
          <span className="text-[10px] text-white font-medium">{series.rating.toFixed(1)}</span>
        </div>

        {/* Season Count - Bottom Left */}
        {seasonCount > 0 && (
          <div className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 rounded">
            <span className="text-[10px] text-white font-medium">S{seasonCount}</span>
          </div>
        )}
      </div>
      
      {/* Info Below Poster */}
      <div className="mt-1.5 px-0.5">
        <p className="text-xs font-medium text-white truncate">{series.title}</p>
        {showGenre && genres && (
          <p className="text-[10px] text-gray-400 truncate">{genres}</p>
        )}
      </div>
    </Link>
  )
}
