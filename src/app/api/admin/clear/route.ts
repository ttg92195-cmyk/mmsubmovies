import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Clear all movies and TV shows
export async function POST() {
  try {
    // Delete all download links first (due to foreign key constraints)
    await db.downloadLink.deleteMany({});
    
    // Delete all episodes
    await db.tVEpisode.deleteMany({});
    
    // Delete all seasons
    await db.tVSeason.deleteMany({});
    
    // Delete all movies
    await db.movie.deleteMany({});
    
    // Delete all TV shows
    await db.tVShow.deleteMany({});
    
    // Reset genre counts
    await db.genre.updateMany({
      data: { count: 0 }
    });
    
    // Reset tag counts
    await db.tag.updateMany({
      data: { count: 0 }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'All posts cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing posts:', error);
    return NextResponse.json(
      { error: 'Failed to clear posts' },
      { status: 500 }
    );
  }
}
