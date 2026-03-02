import { NextResponse } from 'next/server';
import { getTrendingMovies, getTrendingTVShows, getPosterUrl } from '@/lib/tmdb';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const results: {
      movies: Array<{
        id: number;
        title: string;
        poster: string | null;
        backdrop: string | null;
        year: number | null;
        rating: number;
        genres: number[];
        overview: string;
        runtime?: number;
        progress?: number;
      }>;
      tvShows: Array<{
        id: number;
        title: string;
        poster: string | null;
        backdrop: string | null;
        year: number | null;
        rating: number;
        genres: number[];
        overview: string;
        seasons?: number;
      }>;
    } = {
      movies: [],
      tvShows: [],
    };

    if (type === 'all' || type === 'movies') {
      // First check database for trending movies
      const dbMovies = await db.movie.findMany({
        take: 5,
        orderBy: { rating: 'desc' },
      });

      if (dbMovies.length > 0) {
        results.movies = dbMovies.map(movie => ({
          id: parseInt(movie.id),
          title: movie.title,
          poster: movie.poster,
          backdrop: movie.backdrop,
          year: movie.year,
          rating: movie.rating || 0,
          genres: movie.genres ? JSON.parse(movie.genres) : [],
          overview: movie.overview || '',
          runtime: movie.runtime || undefined,
          progress: movie.progress || 0,
        }));
      } else {
        // Fall back to TMDB
        const movies = await getTrendingMovies();
        results.movies = movies.slice(0, 5).map(movie => ({
          id: movie.id,
          title: movie.title,
          poster: getPosterUrl(movie.poster_path),
          backdrop: movie.backdrop_path 
            ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` 
            : null,
          year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
          rating: movie.vote_average,
          genres: movie.genre_ids,
          overview: movie.overview,
        }));
      }
    }

    if (type === 'all' || type === 'tv') {
      // First check database for trending TV shows
      const dbTVShows = await db.tVShow.findMany({
        take: 5,
        orderBy: { rating: 'desc' },
      });

      if (dbTVShows.length > 0) {
        results.tvShows = dbTVShows.map(show => ({
          id: parseInt(show.id),
          title: show.title,
          poster: show.poster,
          backdrop: show.backdrop,
          year: show.year,
          rating: show.rating || 0,
          genres: show.genres ? JSON.parse(show.genres) : [],
          overview: show.overview || '',
          seasons: show.seasons || undefined,
        }));
      } else {
        // Fall back to TMDB
        const tvShows = await getTrendingTVShows();
        results.tvShows = tvShows.slice(0, 5).map(show => ({
          id: show.id,
          title: show.name,
          poster: getPosterUrl(show.poster_path),
          backdrop: show.backdrop_path 
            ? `https://image.tmdb.org/t/p/w780${show.backdrop_path}` 
            : null,
          year: show.first_air_date ? parseInt(show.first_air_date.split('-')[0]) : null,
          rating: show.vote_average,
          genres: show.genre_ids,
          overview: show.overview,
        }));
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching trending:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending content' },
      { status: 500 }
    );
  }
}
