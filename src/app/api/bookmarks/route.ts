import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch bookmarks for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const bookmarks = await db.bookmark.findMany({
      where: { userId },
      include: {
        movie: {
          include: {
            series: {
              include: {
                seasons: {
                  include: {
                    episodes: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    )
  }
}

// POST - Add a bookmark
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, movieId } = body

    if (!userId || !movieId) {
      return NextResponse.json(
        { error: 'User ID and Movie ID are required' },
        { status: 400 }
      )
    }

    // Check if bookmark already exists
    const existingBookmark = await db.bookmark.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    })

    if (existingBookmark) {
      return NextResponse.json(existingBookmark)
    }

    const bookmark = await db.bookmark.create({
      data: {
        userId,
        movieId,
      },
    })

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error('Error creating bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a bookmark
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const movieId = searchParams.get('movieId')

    if (!userId || !movieId) {
      return NextResponse.json(
        { error: 'User ID and Movie ID are required' },
        { status: 400 }
      )
    }

    await db.bookmark.delete({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    )
  }
}
