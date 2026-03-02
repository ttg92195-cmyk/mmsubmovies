'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, Film } from 'lucide-react'
import { Movie } from '@/store'

interface MovieCardProps {
  movie: Movie
  showTitle?: boolean
  showGenre?: boolean
}

export function MovieCard({ movie, showTitle = true, showGenre = false }: MovieCardProps) {
  const genres = movie.genre ? movie.genre.split(', ').filter(Boolean).slice(0, 2).join(' / ') : ''
  const href = movie.isSeries ? `/series/${movie.id}` : `/movie/${movie.id}`

  return (
    <Link href={href} className="block w-full">
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded overflow-hidden bg-gray-900">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="33vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-8 h-8 text-gray-600" />
          </div>
        )}
        
        {/* Year Badge - Top Left */}
        <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded">
          <span className="text-[10px] text-white font-medium">{movie.year}</span>
        </div>
        
        {/* Rating Badge - Top Right */}
        <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
          <span className="text-[10px] text-white font-medium">{movie.rating.toFixed(1)}</span>
        </div>
      </div>
      
      {/* Info Below Poster */}
      {showTitle && (
        <div className="mt-1.5 px-0.5">
          <p className="text-xs font-medium text-white truncate">{movie.title}</p>
          {showGenre && genres && (
            <p className="text-[10px] text-gray-400 truncate">{genres}</p>
          )}
        </div>
      )}
    </Link>
  )
}
