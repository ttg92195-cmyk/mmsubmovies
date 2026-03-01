import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const sampleMovies = [
  {
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
      { name: 'Christian Bale', character: 'Bruce Wayne / Batman', profileUrl: 'https://image.tmdb.org/t/p/w185/qCpZn2e3dimwbryLnqxZuI88PTi.jpg' },
      { name: 'Heath Ledger', character: 'Joker', profileUrl: 'https://image.tmdb.org/t/p/w185/5Y9HnYYa9jF4NunY9lSgJGjSe8E.jpg' },
      { name: 'Aaron Eckhart', character: 'Harvey Dent', profileUrl: 'https://image.tmdb.org/t/p/w185/rGEUUxfPLXMwBKXzax4HFGZO1T6.jpg' },
    ],
    downloadLinks: [
      { quality: '720p', url: '#', source: 'Server-1' },
      { quality: '1080p', url: '#', source: 'Server-1' },
    ]
  },
  {
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
      { name: 'Leonardo DiCaprio', character: 'Dom Cobb', profileUrl: 'https://image.tmdb.org/t/p/w185/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg' },
      { name: 'Joseph Gordon-Levitt', character: 'Arthur', profileUrl: 'https://image.tmdb.org/t/p/w185/zvpTRs6TKLwctQRc4Xkvo6OmGVz.jpg' },
      { name: 'Ellen Page', character: 'Ariadne', profileUrl: 'https://image.tmdb.org/t/p/w185/xPAmJgHxPgFjlqL7pnlCBMbpmev.jpg' },
    ],
    downloadLinks: [
      { quality: '720p', url: '#', source: 'Server-1' },
      { quality: '1080p', url: '#', source: 'Server-1' },
    ]
  },
  {
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
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
    cast: [
      { name: 'Matthew McConaughey', character: 'Cooper', profileUrl: 'https://image.tmdb.org/t/p/w185/wJiGedOCZhwMx9DezY8uwbNxmAY.jpg' },
      { name: 'Anne Hathaway', character: 'Brand', profileUrl: 'https://image.tmdb.org/t/p/w185/tLelKoPNiyJCSEtQTz1FGv4TLGc.jpg' },
      { name: 'Jessica Chastain', character: 'Murph', profileUrl: 'https://image.tmdb.org/t/p/w185/lodMzLKSdrPcBry6TdoDsMN3Vge.jpg' },
    ],
    downloadLinks: [
      { quality: '720p', url: '#', source: 'Server-1' },
      { quality: '1080p', url: '#', source: 'Server-1' },
    ]
  },
  {
    title: 'Breaking Bad',
    overview: 'When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live, he becomes filled with a sense of fearlessness and an unrelenting desire to secure his family\'s financial future.',
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
    cast: [
      { name: 'Bryan Cranston', character: 'Walter White', profileUrl: 'https://image.tmdb.org/t/p/w185/7JahXtJdKZD6YW6Lp5RlQf7t9Q5.jpg' },
      { name: 'Aaron Paul', character: 'Jesse Pinkman', profileUrl: 'https://image.tmdb.org/t/p/w185/uIPtWeJw6QPrDJZzC3NbK9vPmoY.jpg' },
    ],
    downloadLinks: [],
    seriesData: {
      status: 'Ended',
      seasons: [
        { seasonNumber: 1, episodes: Array.from({ length: 7 }, (_, i) => ({ episodeNumber: i + 1, title: `Episode ${i + 1}` })) },
        { seasonNumber: 2, episodes: Array.from({ length: 13 }, (_, i) => ({ episodeNumber: i + 1, title: `Episode ${i + 1}` })) },
      ]
    }
  },
  {
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
    cast: [
      { name: 'Emilia Clarke', character: 'Daenerys Targaryen', profileUrl: 'https://image.tmdb.org/t/p/w185/j7d083zIMhwnKro3tQqDz2Fq1QT.jpg' },
      { name: 'Kit Harington', character: 'Jon Snow', profileUrl: 'https://image.tmdb.org/t/p/w185/5J3H7mq3QWi34QaDQWzXJmJk1Ym.jpg' },
    ],
    downloadLinks: [],
    seriesData: {
      status: 'Ended',
      seasons: [
        { seasonNumber: 1, episodes: Array.from({ length: 10 }, (_, i) => ({ episodeNumber: i + 1, title: `Episode ${i + 1}` })) },
        { seasonNumber: 2, episodes: Array.from({ length: 10 }, (_, i) => ({ episodeNumber: i + 1, title: `Episode ${i + 1}` })) },
      ]
    }
  },
  {
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
    cast: [
      { name: 'Hugh Jackman', character: 'Robert Angier', profileUrl: 'https://image.tmdb.org/t/p/w185/nRNn2JNmU6nyEi6KsCLNWLJxa6D.jpg' },
      { name: 'Christian Bale', character: 'Alfred Borden', profileUrl: 'https://image.tmdb.org/t/p/w185/qCpZn2e3dimwbryLnqxZuI88PTi.jpg' },
      { name: 'Scarlett Johansson', character: 'Olivia Wenscombe', profileUrl: 'https://image.tmdb.org/t/p/w185/6NsMQJmrNMP2pWBqWZAFJge8jJN.jpg' },
    ],
    downloadLinks: [
      { quality: '720p', url: '#', source: 'Server-1' },
      { quality: '1080p', url: '#', source: 'Server-1' },
    ]
  },
  {
    title: 'Avatar',
    overview: 'In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following his orders and protecting the world he feels is his home.',
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
    cast: [
      { name: 'Sam Worthington', character: 'Jake Sully', profileUrl: 'https://image.tmdb.org/t/p/w185/kZCXMVZt9qI7xxj9rt6zJQn8tqD.jpg' },
      { name: 'Zoe Saldana', character: 'Neytiri', profileUrl: 'https://image.tmdb.org/t/p/w185/bP4lzFsP2B9q0Lq3c3qM7Nq0B5r.jpg' },
    ],
    downloadLinks: [
      { quality: '720p', url: '#', source: 'Server-1' },
      { quality: '1080p', url: '#', source: 'Server-1' },
    ]
  },
  {
    title: 'Stranger Things',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
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
    cast: [
      { name: 'Millie Bobby Brown', character: 'Eleven', profileUrl: 'https://image.tmdb.org/t/p/w185/hM04Z7qYDeqw2x3SM6dVxuL6QwD.jpg' },
      { name: 'Finn Wolfhard', character: 'Mike Wheeler', profileUrl: 'https://image.tmdb.org/t/p/w185/7mDG7nGgnNo2r2sWqwMq2qNXPFP.jpg' },
    ],
    downloadLinks: [],
    seriesData: {
      status: 'Returning Series',
      seasons: [
        { seasonNumber: 1, episodes: Array.from({ length: 8 }, (_, i) => ({ episodeNumber: i + 1, title: `Episode ${i + 1}` })) },
        { seasonNumber: 2, episodes: Array.from({ length: 9 }, (_, i) => ({ episodeNumber: i + 1, title: `Episode ${i + 1}` })) },
      ]
    }
  },
]

export async function GET() {
  try {
    // Check if already seeded
    const existingMovies = await db.movie.count()

    if (existingMovies > 0) {
      return NextResponse.json({
        success: true,
        message: 'Database already seeded',
        count: existingMovies
      })
    }

    // Seed movies
    for (const movie of sampleMovies) {
      const { seriesData, cast, downloadLinks, ...movieData } = movie
      const movieId = generateId()

      await db.movie.create({
        data: {
          id: movieId,
          ...movieData,
          updatedAt: new Date(),
          cast: cast ? {
            create: cast.map(c => ({
              id: generateId(),
              name: c.name,
              character: c.character,
              profileUrl: c.profileUrl,
            }))
          } : undefined,
          downloadLinks: downloadLinks && downloadLinks.length > 0 ? {
            create: downloadLinks.map(d => ({
              id: generateId(),
              quality: d.quality,
              url: d.url,
              source: d.source || '',
            }))
          } : undefined,
          series: movieData.isSeries && seriesData ? {
            create: {
              id: generateId(),
              status: seriesData.status,
              seasons: {
                create: seriesData.seasons.map(season => ({
                  id: generateId(),
                  seasonNumber: season.seasonNumber,
                  episodes: {
                    create: season.episodes.map(ep => ({
                      id: generateId(),
                      episodeNumber: ep.episodeNumber,
                      title: ep.title,
                      thumbnailUrl: ep.thumbnailUrl,
                      duration: ep.duration,
                      overview: ep.overview,
                    }))
                  }
                }))
              }
            }
          } : undefined,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      count: sampleMovies.length
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ success: false, message: 'Seed error', error: String(error) }, { status: 500 })
  }
}
