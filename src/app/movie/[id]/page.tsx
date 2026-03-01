import { Metadata } from 'next'
import { MovieDetailClient } from './client'

interface MoviePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/movies/${id}`, {
      cache: 'no-store'
    })
    const data = await res.json()
    
    if (data.success && data.data) {
      return {
        title: `${data.data.title} - BurmaYoteShin`,
        description: data.data.overview || `Watch ${data.data.title} on BurmaYoteShin`,
        openGraph: {
          title: data.data.title,
          description: data.data.overview,
          images: data.data.posterUrl ? [data.data.posterUrl] : [],
        },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }
  
  return {
    title: 'Movie - BurmaYoteShin',
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params
  return <MovieDetailClient id={id} />
}
