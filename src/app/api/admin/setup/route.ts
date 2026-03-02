import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { username: 'Admin867635' },
    });

    if (!existingAdmin) {
      // Create admin user with new credentials
      await db.user.create({
        data: {
          username: 'Admin867635',
          password: 'Admin867635',
          role: 'admin',
        },
      });
    }

    // Create default genres for movies
    const movieGenres = [
      { name: 'Action', color: '#ef4444', type: 'movie', tmdbId: 28 },
      { name: 'Adventure', color: '#3b82f6', type: 'movie', tmdbId: 12 },
      { name: 'Animation', color: '#eab308', type: 'movie', tmdbId: 16 },
      { name: 'Comedy', color: '#a855f7', type: 'movie', tmdbId: 35 },
      { name: 'Crime', color: '#22c55e', type: 'movie', tmdbId: 80 },
      { name: 'Documentary', color: '#ec4899', type: 'movie', tmdbId: 99 },
      { name: 'Drama', color: '#3b82f6', type: 'movie', tmdbId: 18 },
      { name: 'Family', color: '#06b6d4', type: 'movie', tmdbId: 10751 },
      { name: 'Fantasy', color: '#8b5cf6', type: 'movie', tmdbId: 14 },
      { name: 'History', color: '#f59e0b', type: 'movie', tmdbId: 36 },
      { name: 'Horror', color: '#dc2626', type: 'movie', tmdbId: 27 },
      { name: 'Music', color: '#84cc16', type: 'movie', tmdbId: 10402 },
      { name: 'Mystery', color: '#6366f1', type: 'movie', tmdbId: 9648 },
      { name: 'Romance', color: '#f43f5e', type: 'movie', tmdbId: 10749 },
      { name: 'Science Fiction', color: '#0ea5e9', type: 'movie', tmdbId: 878 },
      { name: 'TV Movie', color: '#14b8a6', type: 'movie', tmdbId: 10770 },
      { name: 'Thriller', color: '#f97316', type: 'movie', tmdbId: 53 },
      { name: 'War', color: '#78716c', type: 'movie', tmdbId: 10752 },
      { name: 'Western', color: '#a16207', type: 'movie', tmdbId: 37 },
    ];

    // Create genres for TV shows
    const tvGenres = [
      { name: 'Action & Adventure', color: '#ef4444', type: 'tv', tmdbId: 10759 },
      { name: 'Animation', color: '#eab308', type: 'tv', tmdbId: 16 },
      { name: 'Comedy', color: '#a855f7', type: 'tv', tmdbId: 35 },
      { name: 'Crime', color: '#22c55e', type: 'tv', tmdbId: 80 },
      { name: 'Documentary', color: '#ec4899', type: 'tv', tmdbId: 99 },
      { name: 'Drama', color: '#3b82f6', type: 'tv', tmdbId: 18 },
      { name: 'Family', color: '#06b6d4', type: 'tv', tmdbId: 10751 },
      { name: 'Kids', color: '#fbbf24', type: 'tv', tmdbId: 10762 },
      { name: 'Mystery', color: '#6366f1', type: 'tv', tmdbId: 9648 },
      { name: 'News', color: '#64748b', type: 'tv', tmdbId: 10763 },
      { name: 'Reality', color: '#f43f5e', type: 'tv', tmdbId: 10764 },
      { name: 'Sci-Fi & Fantasy', color: '#0ea5e9', type: 'tv', tmdbId: 10765 },
      { name: 'Soap', color: '#ec4899', type: 'tv', tmdbId: 10766 },
      { name: 'Talk', color: '#84cc16', type: 'tv', tmdbId: 10767 },
      { name: 'War & Politics', color: '#78716c', type: 'tv', tmdbId: 10768 },
      { name: 'Western', color: '#a16207', type: 'tv', tmdbId: 37 },
    ];

    // Create default tags
    const tags = [
      { name: '4K', color: '#ef4444', type: 'movie' },
      { name: 'Animation', color: '#3b82f6', type: 'movie' },
      { name: 'Anime', color: '#eab308', type: 'movie' },
      { name: 'Bollywood', color: '#a855f7', type: 'movie' },
      { name: 'Featured Movies', color: '#ec4899', type: 'movie' },
      { name: '4K', color: '#ef4444', type: 'tv' },
      { name: 'Animation', color: '#3b82f6', type: 'tv' },
      { name: 'Anime', color: '#eab308', type: 'tv' },
      { name: 'C Drama', color: '#22c55e', type: 'tv' },
      { name: 'K Drama', color: '#3b82f6', type: 'tv' },
    ];

    // Insert genres using upsert
    for (const genre of [...movieGenres, ...tvGenres]) {
      try {
        await db.genre.upsert({
          where: {
            tmdbId_type: {
              tmdbId: genre.tmdbId!,
              type: genre.type,
            },
          },
          update: genre,
          create: genre,
        });
      } catch {
        // If upsert fails, try to create
        try {
          await db.genre.create({ data: genre });
        } catch {
          // Ignore if already exists
        }
      }
    }

    // Insert tags (delete existing first to avoid duplicates)
    try {
      await db.tag.deleteMany({});
    } catch {
      // Ignore
    }
    for (const tag of tags) {
      try {
        await db.tag.create({ data: tag });
      } catch {
        // Ignore
      }
    }

    // Create default servers
    const servers = [
      { name: 'Megaup', color: '#ef4444' },
      { name: 'Mega', color: '#3b82f6' },
      { name: 'Yoteshin', color: '#22c55e' },
    ];

    for (const server of servers) {
      try {
        await db.serverName.upsert({
          where: { name: server.name },
          update: server,
          create: server,
        });
      } catch {
        // Ignore
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Setup completed successfully',
      admin: { username: 'Admin867635', password: 'Admin867635' }
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
