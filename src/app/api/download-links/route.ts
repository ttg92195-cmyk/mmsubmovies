import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// POST - Add download link to movie or episode
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { movieId, episodeId, source, quality, url } = body

    if (!url || !quality) {
      return NextResponse.json({ success: false, message: 'URL and quality are required' }, { status: 400 })
    }

    if (!movieId && !episodeId) {
      return NextResponse.json({ success: false, message: 'Movie ID or Episode ID is required' }, { status: 400 })
    }

    const downloadLink = await db.downloadLink.create({
      data: {
        id: generateId(),
        source: source || '',
        quality,
        url,
        movieId: movieId || null,
        episodeId: episodeId || null,
      }
    })

    return NextResponse.json({ success: true, data: downloadLink })
  } catch (error) {
    console.error('Error creating download link:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

// PUT - Update download link
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, source, quality, url } = body

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 })
    }

    const downloadLink = await db.downloadLink.update({
      where: { id },
      data: {
        source: source || '',
        quality,
        url,
      }
    })

    return NextResponse.json({ success: true, data: downloadLink })
  } catch (error) {
    console.error('Error updating download link:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

// DELETE - Delete download link
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 })
    }

    await db.downloadLink.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting download link:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

// GET - Get download links for movie or episode
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')
    const episodeId = searchParams.get('episodeId')

    if (!movieId && !episodeId) {
      return NextResponse.json({ success: false, message: 'Movie ID or Episode ID is required' }, { status: 400 })
    }

    const where: { movieId?: string; episodeId?: string } = {}
    if (movieId) where.movieId = movieId
    if (episodeId) where.episodeId = episodeId

    const downloadLinks = await db.downloadLink.findMany({
      where
    })

    return NextResponse.json({ success: true, data: downloadLinks })
  } catch (error) {
    console.error('Error fetching download links:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
