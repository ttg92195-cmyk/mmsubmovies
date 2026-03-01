import { Metadata } from 'next'
import { SeriesDetailClient } from './client'

interface SeriesPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
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
    title: 'Series - BurmaYoteShin',
  }
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { id } = await params
  return <SeriesDetailClient id={id} />
}
