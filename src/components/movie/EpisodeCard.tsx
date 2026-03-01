'use client'

import Image from 'next/image'
import { Play } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface EpisodeCardProps {
  episodeNumber: number
  title: string
  thumbnailUrl?: string | null
  duration?: number | null
  overview?: string | null
  onClick?: () => void
}

export function EpisodeCard({
  episodeNumber,
  title,
  thumbnailUrl,
  duration,
  overview,
  onClick,
}: EpisodeCardProps) {
  return (
    <Card
      className="flex gap-3 p-2 bg-card border-0 overflow-hidden cursor-pointer hover:bg-accent transition-colors"
      onClick={onClick}
    >
      <div className="relative w-[120px] flex-shrink-0 aspect-video rounded overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="120px"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-muted-foreground text-xs">Episode {episodeNumber}</span>
          </div>
        )}
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="w-5 h-5 text-black fill-black" />
          </div>
        </div>
        
        {/* Duration */}
        {duration && (
          <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-xs">
            {Math.floor(duration / 60)}h {duration % 60}m
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-2">
          <span className="text-primary font-medium text-sm">E{episodeNumber}</span>
          <p className="text-sm font-medium truncate">{title}</p>
        </div>
        {overview && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{overview}</p>
        )}
      </div>
    </Card>
  )
}
