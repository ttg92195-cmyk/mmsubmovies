import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch tags
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movie';

    const tags = await db.tag.findMany({
      where: { type },
      orderBy: { name: 'asc' },
    });

    // Get counts from the actual data (since tags are manually assigned)
    // For now, return tags with placeholder counts
    const tagsWithCounts = tags.map(tag => ({
      ...tag,
      count: tag.count,
    }));

    return NextResponse.json({ tags: tagsWithCounts });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
