import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getMovieGenres, getTVGenres } from '@/lib/tmdb';

// GET - Fetch genres with counts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movie';

    // Get all movies/TV shows to count genres
    let items: { genres: string | null }[] = [];
    
    if (type === 'movie') {
      items = await db.movie.findMany({
        select: { genres: true },
      });
    } else {
      items = await db.tVShow.findMany({
        select: { genres: true },
      });
    }

    // Count genres
    const genreCounts: Record<string, number> = {};
    
    items.forEach(item => {
      if (item.genres) {
        try {
          const genreIds = JSON.parse(item.genres);
          genreIds.forEach((id: number) => {
            const key = String(id);
            genreCounts[key] = (genreCounts[key] || 0) + 1;
          });
        } catch {
          // Ignore parse errors
        }
      }
    });

    // Get genres from database
    const genres = await db.genre.findMany({
      where: { type },
      orderBy: { name: 'asc' },
    });

    // Update counts
    const genresWithCounts = genres.map(genre => ({
      ...genre,
      count: genreCounts[String(genre.tmdbId)] || 0,
    }));

    // If no genres in database, fetch from TMDB
    if (genres.length === 0) {
      const tmdbGenres = type === 'tv' ? await getTVGenres() : await getMovieGenres();
      
      const colorPalette = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e'];
      
      const newGenres = await Promise.all(
        tmdbGenres.map(async (g: { id: number; name: string }, index: number) => {
          return db.genre.create({
            data: {
              name: g.name,
              color: colorPalette[index % colorPalette.length],
              type,
              tmdbId: g.id,
              count: genreCounts[String(g.id)] || 0,
            },
          });
        })
      );
      
      return NextResponse.json({ genres: newGenres });
    }

    return NextResponse.json({ genres: genresWithCounts });
  } catch (error) {
    console.error('Error fetching genres:', error);
    return NextResponse.json({ genres: [] });
  }
}
