import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering but allow caching
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 60 seconds

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// GET - List all movies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'movie' or 'series'
    const trending = searchParams.get('trending')
    const iconic = searchParams.get('iconic')
    const search = searchParams.get('search')
    const genre = searchParams.get('genre')
    const simple = searchParams.get('simple') // Light version for lists

    const where: Record<string, unknown> = {}

    if (type === 'movie') {
      where.isSeries = false
    } else if (type === 'series') {
      where.isSeries = true
    }

    if (trending === 'true') {
      where.isTrending = true
    }

    if (iconic === 'true') {
      where.isIconic = true
    }

    if (search) {
      where.title = {
        contains: search,
      }
    }

    if (genre) {
      where.genre = {
        contains: genre,
      }
    }

    // Simple query for list views (faster)
    if (simple === 'true') {
      const movies = await db.movie.findMany({
        where,
        select: {
          id: true,
          title: true,
          posterUrl: true,
          backdropUrl: true,
          rating: true,
          year: true,
          duration: true,
          genre: true,
          isSeries: true,
          isTrending: true,
          isIconic: true,
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(
        { success: true, data: movies },
        { headers: { 
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        } }
      )
    }

    // Full query for detail views
    const movies = await db.movie.findMany({
      where,
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
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(
      { success: true, data: movies },
      { headers: { 
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      } }
    )
  } catch (error) {
    console.error('Error fetching movies:', error)
    // Return empty array instead of error for better UX
    return NextResponse.json(
      { success: true, data: [] },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
  }
}

// POST - Create new movie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      overview,
      posterUrl,
      backdropUrl,
      rating,
      year,
      duration,
      genre,
      language,
      isSeries,
      isTrending,
      isIconic,
      cast,
      downloadLinks,
      seriesData,
    } = body

    const movieId = generateId()

    const movie = await db.movie.create({
      data: {
        id: movieId,
        title,
        overview,
        posterUrl,
        backdropUrl,
        rating: rating || 0,
        year,
        duration,
        genre,
        language,
        isSeries: isSeries || false,
        isTrending: isTrending || false,
        isIconic: isIconic || false,
        updatedAt: new Date(),
        cast: cast ? {
          create: cast.map((c: { name: string; character: string; profileUrl?: string }) => ({
            id: generateId(),
            name: c.name,
            character: c.character,
            profileUrl: c.profileUrl,
          }))
        } : undefined,
        downloadLinks: downloadLinks ? {
          create: downloadLinks.map((d: { quality: string; url: string; source?: string }) => ({
            id: generateId(),
            quality: d.quality,
            url: d.url,
            source: d.source || '',
          }))
        } : undefined,
        series: isSeries && seriesData ? {
          create: {
            id: generateId(),
            status: seriesData.status || 'Ongoing',
            seasons: seriesData.seasons ? {
              create: seriesData.seasons.map((season: { seasonNumber: number; episodes: { episodeNumber: number; title: string; thumbnailUrl?: string; duration?: number; overview?: string }[] }) => ({
                id: generateId(),
                seasonNumber: season.seasonNumber,
                episodes: {
                  create: season.episodes.map((ep: { episodeNumber: number; title: string; thumbnailUrl?: string; duration?: number; overview?: string }) => ({
                    id: generateId(),
                    episodeNumber: ep.episodeNumber,
                    title: ep.title,
                    thumbnailUrl: ep.thumbnailUrl,
                    duration: ep.duration,
                    overview: ep.overview,
                  }))
                }
              }))
            } : undefined
          }
        } : undefined,
      },
      include: {
        cast: true,
        downloadLinks: true,
        series: {
          include: {
            seasons: {
              include: {
                episodes: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: movie })
  } catch (error) {
    console.error('Error creating movie:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

// PUT - Update movie
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    const movie = await db.movie.update({
      where: { id },
      data: {
        title: data.title,
        overview: data.overview,
        posterUrl: data.posterUrl,
        backdropUrl: data.backdropUrl,
        rating: data.rating,
        year: data.year,
        duration: data.duration,
        genre: data.genre,
        language: data.language,
        isTrending: data.isTrending,
        isIconic: data.isIconic,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: movie })
  } catch (error) {
    console.error('Error updating movie:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

// DELETE - Delete movie
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })
    }

    await db.movie.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
