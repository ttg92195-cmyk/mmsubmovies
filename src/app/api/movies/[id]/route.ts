import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch single movie
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const movie = await db.movie.findUnique({
      where: { id },
    });

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...movie,
      genres: movie.genres ? JSON.parse(movie.genres) : [],
    });
  } catch (error) {
    console.error('Error fetching movie:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    );
  }
}

// PUT - Update movie
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Build update data with only provided fields
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.poster !== undefined) updateData.poster = body.poster;
    if (body.backdrop !== undefined) updateData.backdrop = body.backdrop;
    if (body.year !== undefined) updateData.year = body.year ? parseInt(body.year) : null;
    if (body.rating !== undefined) updateData.rating = body.rating ? parseFloat(body.rating) : null;
    if (body.quality !== undefined) updateData.quality = body.quality;
    if (body.runtime !== undefined) updateData.runtime = body.runtime ? parseInt(body.runtime) : null;
    if (body.genres !== undefined) updateData.genres = body.genres ? JSON.stringify(body.genres) : null;
    if (body.overview !== undefined) updateData.overview = body.overview;
    if (body.progress !== undefined) updateData.progress = body.progress ? parseInt(body.progress) : 0;

    const movie = await db.movie.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error updating movie:', error);
    return NextResponse.json(
      { error: 'Failed to update movie' },
      { status: 500 }
    );
  }
}

// DELETE - Delete movie
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.movie.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Movie deleted' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    return NextResponse.json(
      { error: 'Failed to delete movie' },
      { status: 500 }
    );
  }
}
