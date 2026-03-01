'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'

interface CastCardProps {
  name: string
  character: string
  profileUrl?: string | null
}

export function CastCard({ name, character, profileUrl }: CastCardProps) {
  return (
    <Card className="w-[100px] flex-shrink-0 bg-card border-0 overflow-hidden">
      <div className="relative aspect-square">
        {profileUrl ? (
          <Image
            src={profileUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="100px"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-muted-foreground text-2xl font-bold">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-2 text-center">
        <p className="text-xs font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{character}</p>
      </div>
    </Card>
  )
}
