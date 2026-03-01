'use client'

import { MovieDetailContent } from '@/components/movie/MovieDetailContent'
import { BottomNav } from '@/components/movie/BottomNav'

interface SeriesDetailClientProps {
  id: string
}

export function SeriesDetailClient({ id }: SeriesDetailClientProps) {
  return (
    <>
      <MovieDetailContent movieId={id} type="series" />
      <BottomNav />
    </>
  )
}
