import { NextResponse } from 'next/server';
import { getMovieGenres, getTVGenres } from '@/lib/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movie';

    const genres = type === 'tv' ? await getTVGenres() : await getMovieGenres();

    return NextResponse.json({ genres });
  } catch (error) {
    console.error('Error fetching TMDB genres:', error);
    return NextResponse.json(
      { error: 'Failed to fetch genres' },
      { status: 500 }
    );
  }
}
