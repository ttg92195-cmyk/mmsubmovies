'use client'

import { MovieDetailContent } from '@/components/movie/MovieDetailContent'
import { BottomNav } from '@/components/movie/BottomNav'

interface MovieDetailClientProps {
  id: string
}

export function MovieDetailClient({ id }: MovieDetailClientProps) {
  return (
    <>
      <MovieDetailContent movieId={id} type="movie" />
      <BottomNav />
    </>
  )
}
