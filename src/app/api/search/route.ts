import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { searchMovies, searchTVShows, getPosterUrl } from '@/lib/tmdb';

// GET - Search in database and optionally TMDB
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const source = searchParams.get('source') || 'database';
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');

    if (!query) {
      return NextResponse.json({ movies: [], tvShows: [], totalPages: 1, currentPage: 1 });
    }

    if (source === 'tmdb') {
      // Search from TMDB
      if (type === 'movie') {
        const movieResults = await searchMovies(query, page);
        return NextResponse.json({
          movies: movieResults.results.map((m: { id: number; title: string; poster_path: string | null; release_date: string; vote_average: number; genre_ids: number[]; overview: string; backdrop_path: string | null }) => ({
            id: m.id,
            tmdbId: m.id,
            title: m.title,
            poster: getPosterUrl(m.poster_path),
            backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
            year: m.release_date ? parseInt(m.release_date.split('-')[0]) : null,
            rating: m.vote_average,
            genres: m.genre_ids,
            overview: m.overview,
            type: 'movie',
          })),
          tvShows: [],
          totalPages: movieResults.total_pages,
          currentPage: page,
        });
      } else if (type === 'tv') {
        const tvResults = await searchTVShows(query, page);
        return NextResponse.json({
          movies: [],
          tvShows: tvResults.results.map((t: { id: number; name: string; poster_path: string | null; first_air_date: string; vote_average: number; genre_ids: number[]; overview: string; backdrop_path: string | null; number_of_seasons?: number }) => ({
            id: t.id,
            tmdbId: t.id,
            title: t.name,
            poster: getPosterUrl(t.poster_path),
            backdrop: t.backdrop_path ? `https://image.tmdb.org/t/p/w780${t.backdrop_path}` : null,
            year: t.first_air_date ? parseInt(t.first_air_date.split('-')[0]) : null,
            rating: t.vote_average,
            genres: t.genre_ids,
            overview: t.overview,
            seasons: t.number_of_seasons || 1,
            type: 'tv',
          })),
          totalPages: tvResults.total_pages,
          currentPage: page,
        });
      } else {
        // Search both
        const [movieResults, tvResults] = await Promise.all([
          searchMovies(query, page),
          searchTVShows(query, page),
        ]);

        return NextResponse.json({
          movies: movieResults.results.map((m: { id: number; title: string; poster_path: string | null; release_date: string; vote_average: number; genre_ids: number[]; overview: string; backdrop_path: string | null }) => ({
            id: m.id,
            tmdbId: m.id,
            title: m.title,
            poster: getPosterUrl(m.poster_path),
            backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
            year: m.release_date ? parseInt(m.release_date.split('-')[0]) : null,
            rating: m.vote_average,
            genres: m.genre_ids,
            overview: m.overview,
            type: 'movie',
          })),
          tvShows: tvResults.results.map((t: { id: number; name: string; poster_path: string | null; first_air_date: string; vote_average: number; genre_ids: number[]; overview: string; backdrop_path: string | null; number_of_seasons?: number }) => ({
            id: t.id,
            tmdbId: t.id,
            title: t.name,
            poster: getPosterUrl(t.poster_path),
            backdrop: t.backdrop_path ? `https://image.tmdb.org/t/p/w780${t.backdrop_path}` : null,
            year: t.first_air_date ? parseInt(t.first_air_date.split('-')[0]) : null,
            rating: t.vote_average,
            genres: t.genre_ids,
            overview: t.overview,
            seasons: t.number_of_seasons || 1,
            type: 'tv',
          })),
          totalPages: Math.max(movieResults.total_pages, tvResults.total_pages),
          currentPage: page,
        });
      }
    }

    // Search from database
    const searchQuery = `%${query}%`;
    
    const movies = await db.$queryRaw<Array<{ id: string; title: string; poster: string | null; year: number | null; rating: number | null; genres: string | null }>>`
      SELECT id, title, poster, year, rating, genres 
      FROM Movie 
      WHERE title LIKE ${searchQuery} OR overview LIKE ${searchQuery}
      ORDER BY rating DESC
      LIMIT 20
    `;

    const tvShows = await db.$queryRaw<Array<{ id: string; title: string; poster: string | null; year: number | null; rating: number | null; genres: string | null; seasons: number | null }>>`
      SELECT id, title, poster, year, rating, genres, seasons 
      FROM TVShow 
      WHERE title LIKE ${searchQuery} OR overview LIKE ${searchQuery}
      ORDER BY rating DESC
      LIMIT 20
    `;

    return NextResponse.json({
      movies: movies.map(m => ({
        ...m,
        genres: m.genres ? JSON.parse(m.genres) : [],
        type: 'movie',
      })),
      tvShows: tvShows.map(t => ({
        ...t,
        genres: t.genres ? JSON.parse(t.genres) : [],
        type: 'tv',
      })),
      totalPages: 1,
      currentPage: 1,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ movies: [], tvShows: [], totalPages: 1, currentPage: 1 });
  }
}
