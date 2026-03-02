import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch single TV show
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const tvShow = await db.tVShow.findUnique({
      where: { id },
    });

    if (!tvShow) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...tvShow,
      genres: tvShow.genres ? JSON.parse(tvShow.genres) : [],
    });
  } catch (error) {
    console.error('Error fetching TV show:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TV show' },
      { status: 500 }
    );
  }
}

// PUT - Update TV show
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
    if (body.seasons !== undefined) updateData.seasons = body.seasons ? parseInt(body.seasons) : null;
    if (body.genres !== undefined) updateData.genres = body.genres ? JSON.stringify(body.genres) : null;
    if (body.overview !== undefined) updateData.overview = body.overview;

    const tvShow = await db.tVShow.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(tvShow);
  } catch (error) {
    console.error('Error updating TV show:', error);
    return NextResponse.json(
      { error: 'Failed to update TV show' },
      { status: 500 }
    );
  }
}

// DELETE - Delete TV show
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.tVShow.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'TV show deleted' });
  } catch (error) {
    console.error('Error deleting TV show:', error);
    return NextResponse.json(
      { error: 'Failed to delete TV show' },
      { status: 500 }
    );
  }
}
