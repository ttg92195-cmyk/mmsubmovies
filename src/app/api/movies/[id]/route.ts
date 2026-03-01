import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Sample fallback data for Vercel
const SAMPLE_MOVIES: Record<string, object> = {
  '1': {
    id: '1',
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    rating: 9.0,
    year: 2008,
    duration: 152,
    genre: 'Action, Crime, Drama',
    language: 'en',
    isSeries: false,
    isTrending: true,
    isIconic: true,
    cast: [
      { id: 'c1', name: 'Christian Bale', character: 'Bruce Wayne / Batman', profileUrl: 'https://image.tmdb.org/t/p/w185/qCpZn2e3dimwbryLnqxZuI88PTi.jpg' },
      { id: 'c2', name: 'Heath Ledger', character: 'Joker', profileUrl: 'https://image.tmdb.org/t/p/w185/5Y9HnYYa9jF4NunY9lSgJGjSe8E.jpg' },
    ],
    downloadLinks: [
      { id: 'd1', quality: '720p', url: '#', source: 'Server-1' },
      { id: 'd2', quality: '1080p', url: '#', source: 'Server-1' },
    ],
    series: null
  },
  '2': {
    id: '2',
    title: 'Inception',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep9B1QDKYHz.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    rating: 8.8,
    year: 2010,
    duration: 148,
    genre: 'Action, Science Fiction, Adventure',
    language: 'en',
    isSeries: false,
    isTrending: true,
    isIconic: true,
    cast: [
      { id: 'c3', name: 'Leonardo DiCaprio', character: 'Dom Cobb', profileUrl: 'https://image.tmdb.org/t/p/w185/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg' },
      { id: 'c4', name: 'Joseph Gordon-Levitt', character: 'Arthur', profileUrl: 'https://image.tmdb.org/t/p/w185/zvpTRs6TKLwctQRc4Xkvo6OmGVz.jpg' },
    ],
    downloadLinks: [
      { id: 'd3', quality: '720p', url: '#', source: 'Server-1' },
      { id: 'd4', quality: '1080p', url: '#', source: 'Server-1' },
    ],
    series: null
  },
  '3': {
    id: '3',
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    rating: 8.7,
    year: 2014,
    duration: 169,
    genre: 'Adventure, Drama, Science Fiction',
    language: 'en',
    isSeries: false,
    isTrending: false,
    isIconic: true,
    cast: [],
    downloadLinks: [],
    series: null
  },
  '4': {
    id: '4',
    title: 'Breaking Bad',
    overview: 'When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    rating: 9.0,
    year: 2008,
    duration: 47,
    genre: 'Drama, Crime',
    language: 'en',
    isSeries: true,
    isTrending: true,
    isIconic: true,
    cast: [],
    downloadLinks: [],
    series: {
      id: 's1',
      status: 'Ended',
      seasons: [
        { id: 'ss1', seasonNumber: 1, episodes: Array.from({ length: 7 }, (_, i) => ({ id: `ep1${i}`, episodeNumber: i + 1, title: `Episode ${i + 1}`, downloadLinks: [] })) },
        { id: 'ss2', seasonNumber: 2, episodes: Array.from({ length: 13 }, (_, i) => ({ id: `ep2${i}`, episodeNumber: i + 1, title: `Episode ${i + 1}`, downloadLinks: [] })) },
      ]
    }
  },
  '5': {
    id: '5',
    title: 'Game of Thrones',
    overview: 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
    rating: 8.5,
    year: 2011,
    duration: 60,
    genre: 'Drama, Fantasy, Action',
    language: 'en',
    isSeries: true,
    isTrending: true,
    isIconic: false,
    cast: [],
    downloadLinks: [],
    series: {
      id: 's2',
      status: 'Ended',
      seasons: [
        { id: 'ss3', seasonNumber: 1, episodes: Array.from({ length: 10 }, (_, i) => ({ id: `ep3${i}`, episodeNumber: i + 1, title: `Episode ${i + 1}`, downloadLinks: [] })) },
        { id: 'ss4', seasonNumber: 2, episodes: Array.from({ length: 10 }, (_, i) => ({ id: `ep4${i}`, episodeNumber: i + 1, title: `Episode ${i + 1}`, downloadLinks: [] })) },
      ]
    }
  },
  '6': {
    id: '6',
    title: 'Stranger Things',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    rating: 8.6,
    year: 2016,
    duration: 50,
    genre: 'Drama, Mystery, Sci-Fi & Fantasy',
    language: 'en',
    isSeries: true,
    isTrending: true,
    isIconic: false,
    cast: [],
    downloadLinks: [],
    series: {
      id: 's3',
      status: 'Returning Series',
      seasons: [
        { id: 'ss5', seasonNumber: 1, episodes: Array.from({ length: 8 }, (_, i) => ({ id: `ep5${i}`, episodeNumber: i + 1, title: `Episode ${i + 1}`, downloadLinks: [] })) },
        { id: 'ss6', seasonNumber: 2, episodes: Array.from({ length: 9 }, (_, i) => ({ id: `ep6${i}`, episodeNumber: i + 1, title: `Episode ${i + 1}`, downloadLinks: [] })) },
      ]
    }
  },
  '7': {
    id: '7',
    title: 'Avatar',
    overview: 'In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosbbVrny.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    rating: 7.6,
    year: 2009,
    duration: 162,
    genre: 'Action, Adventure, Fantasy',
    language: 'en',
    isSeries: false,
    isTrending: true,
    isIconic: false,
    cast: [],
    downloadLinks: [],
    series: null
  },
  '8': {
    id: '8',
    title: 'The Prestige',
    overview: 'A mysterious story of two magicians whose intense rivalry leads them on a life-long battle for supremacy.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/c4z4tBaXfXpTLK0LK6j9A5GX4L.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/9lgyhfNB6jH1Yn8bz6DgE5e5MqG.jpg',
    rating: 8.5,
    year: 2006,
    duration: 130,
    genre: 'Drama, Mystery, Thriller',
    language: 'en',
    isSeries: false,
    isTrending: false,
    isIconic: true,
    cast: [],
    downloadLinks: [],
    series: null
  },
}

// GET - Fetch single movie by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const movie = await db.movie.findUnique({
      where: { id },
      include: {
        cast: true,
        downloadLinks: true,
        series: {
          include: {
            seasons: {
              include: {
                episodes: {
                  include: {
                    downloadLinks: true,
                  }
                }
              },
              orderBy: { seasonNumber: 'asc' }
            }
          }
        }
      }
    })

    if (movie) {
      return NextResponse.json({ success: true, data: movie })
    }
    
    // Fallback to sample data for Vercel
    if (SAMPLE_MOVIES[id]) {
      return NextResponse.json({ success: true, data: SAMPLE_MOVIES[id] })
    }

    return NextResponse.json({ success: false, message: 'Movie not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching movie:', error)
    
    // Try sample data on error (for Vercel)
    const { id } = await params
    if (SAMPLE_MOVIES[id]) {
      return NextResponse.json({ success: true, data: SAMPLE_MOVIES[id] })
    }
    
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

// DELETE - Delete movie by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.movie.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
