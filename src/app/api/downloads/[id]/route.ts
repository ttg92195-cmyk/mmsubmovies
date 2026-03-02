import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch single download link
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const link = await db.downloadLink.findUnique({
      where: { id },
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error('Error fetching download link:', error);
    return NextResponse.json({ error: 'Failed to fetch download link' }, { status: 500 });
  }
}

// PUT - Update download link
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { serverName, size, resolution, url } = body;

    const link = await db.downloadLink.update({
      where: { id },
      data: {
        serverName,
        size,
        resolution,
        url,
      },
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error('Error updating download link:', error);
    return NextResponse.json({ error: 'Failed to update download link' }, { status: 500 });
  }
}

// DELETE - Delete download link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.downloadLink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Download link deleted' });
  } catch (error) {
    console.error('Error deleting download link:', error);
    return NextResponse.json({ error: 'Failed to delete download link' }, { status: 500 });
  }
}
