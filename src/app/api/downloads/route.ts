import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch download links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let movieId = searchParams.get('movieId');
    const episodeId = searchParams.get('episodeId');

    // If movieId looks like a TMDB ID (numeric only), find the database movie first
    if (movieId && /^\d+$/.test(movieId)) {
      const dbMovie = await db.movie.findFirst({
        where: { tmdbId: parseInt(movieId) }
      });
      if (dbMovie) {
        movieId = dbMovie.id;
      }
    }

    const where: { movieId?: string; episodeId?: string } = {};
    if (movieId) where.movieId = movieId;
    if (episodeId) where.episodeId = episodeId;

    const links = await db.downloadLink.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching download links:', error);
    return NextResponse.json({ links: [] });
  }
}

// POST - Create download link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { movieId, episodeId, serverName, url, size, resolution } = body;

    if (!serverName || !url) {
      return NextResponse.json({ error: 'Server name and URL are required' }, { status: 400 });
    }

    // If movieId looks like a TMDB ID (numeric only), find or create the movie
    if (movieId && /^\d+$/.test(movieId)) {
      let dbMovie = await db.movie.findFirst({
        where: { tmdbId: parseInt(movieId) }
      });
      
      if (!dbMovie) {
        // Need to create the movie first - but we need movie data
        // Return error asking to save movie first
        return NextResponse.json({ 
          error: 'Please save this movie to database first',
          needsSave: true,
          tmdbId: movieId
        }, { status: 400 });
      }
      
      movieId = dbMovie.id;
    }

    if (!movieId && !episodeId) {
      return NextResponse.json({ error: 'Either movieId or episodeId is required' }, { status: 400 });
    }

    const where: { movieId?: string; episodeId?: string } = {};
    if (movieId) where.movieId = movieId;
    if (episodeId) where.episodeId = episodeId;

    const highestOrder = await db.downloadLink.findFirst({
      where,
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const link = await db.downloadLink.create({
      data: {
        movieId: movieId || null,
        episodeId: episodeId || null,
        serverName,
        url,
        size: size || '',
        resolution: resolution || '',
        order: (highestOrder?.order || 0) + 1,
      },
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error('Error creating download link:', error);
    return NextResponse.json({ error: 'Failed to create download link' }, { status: 500 });
  }
}

// PUT - Update download link
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, serverName, url, size, resolution } = body;

    const link = await db.downloadLink.update({
      where: { id },
      data: { serverName, url, size, resolution },
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error('Error updating download link:', error);
    return NextResponse.json({ error: 'Failed to update download link' }, { status: 500 });
  }
}

// DELETE - Delete download link
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    await db.downloadLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting download link:', error);
    return NextResponse.json({ error: 'Failed to delete download link' }, { status: 500 });
  }
}
