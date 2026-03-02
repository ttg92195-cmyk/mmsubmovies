import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPopularMovies, discoverMovies, getMovieDetails, getPosterUrl, searchMovies } from '@/lib/tmdb';

// GET - Fetch movies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'database';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const genre = searchParams.get('genre');
    const year = searchParams.get('year');
    const search = searchParams.get('search');
    const tmdbId = searchParams.get('tmdbId');

    // Get single movie by TMDB ID from database
    if (tmdbId && source === 'database') {
      const movie = await db.movie.findFirst({
        where: { tmdbId: parseInt(tmdbId) }
      });
      if (movie) {
        return NextResponse.json({
          movie: {
            ...movie,
            genres: movie.genres ? JSON.parse(movie.genres) : [],
          }
        });
      }
      return NextResponse.json({ movie: null });
    }

    // Search TMDB
    if (search && source === 'tmdb') {
      const result = await searchMovies(search, page);
      return NextResponse.json({
        movies: result.results.map(movie => ({
          id: movie.id.toString(),
          tmdbId: movie.id,
          title: movie.title,
          poster: getPosterUrl(movie.poster_path),
          backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : null,
          year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
          rating: movie.vote_average,
          overview: movie.overview,
          genres: movie.genre_ids,
        })),
        totalPages: result.total_pages,
        currentPage: page,
      });
    }

    // Single movie by TMDB ID from TMDB API
    if (tmdbId && source === 'tmdb') {
      const movie = await getMovieDetails(parseInt(tmdbId));
      return NextResponse.json({
        movie: {
          id: movie.id.toString(),
          tmdbId: movie.id,
          title: movie.title,
          poster: getPosterUrl(movie.poster_path),
          backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : null,
          year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
          rating: movie.vote_average,
          overview: movie.overview,
          genres: movie.genre_ids || movie.genres?.map((g: { id: number }) => g.id) || [],
          runtime: movie.runtime,
        },
      });
    }

    // Fetch from TMDB
    if (source === 'tmdb') {
      if (genre || year) {
        const result = await discoverMovies({
          page,
          with_genres: genre || undefined,
          primary_release_year: year || undefined,
        });
        return NextResponse.json({
          movies: result.results.map(movie => ({
            id: movie.id.toString(),
            tmdbId: movie.id,
            title: movie.title,
            poster: getPosterUrl(movie.poster_path),
            backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : null,
            year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
            rating: movie.vote_average,
            overview: movie.overview,
            genres: movie.genre_ids,
            runtime: movie.runtime,
          })),
          totalPages: result.total_pages,
          currentPage: page,
        });
      } else {
        const result = await getPopularMovies(page);
        return NextResponse.json({
          movies: result.results.map(movie => ({
            id: movie.id.toString(),
            tmdbId: movie.id,
            title: movie.title,
            poster: getPosterUrl(movie.poster_path),
            backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : null,
            year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
            rating: movie.vote_average,
            overview: movie.overview,
            genres: movie.genre_ids,
          })),
          totalPages: result.total_pages,
          currentPage: page,
        });
      }
    }

    // Fetch from database
    const where: { genres?: { contains: string } } = {};
    
    if (genre) {
      where.genres = { contains: genre };
    }

    const skip = (page - 1) * limit;
    
    const movies = await db.movie.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await db.movie.count({ where });

    return NextResponse.json({
      movies: movies.map(movie => ({
        ...movie,
        genres: movie.genres ? JSON.parse(movie.genres) : [],
      })),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json({ movies: [], total: 0, totalPages: 0 });
  }
}

// POST - Create movie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, poster, backdrop, year, rating, quality, runtime, genres, overview, tmdbId, progress } = body;

    // Check if movie exists
    if (tmdbId) {
      const existing = await db.movie.findFirst({ where: { tmdbId: parseInt(tmdbId) } });
      if (existing) {
        return NextResponse.json(existing);
      }
    }

    const movie = await db.movie.create({
      data: {
        title,
        poster,
        backdrop,
        year: year ? parseInt(year) : null,
        rating: rating ? parseFloat(rating) : null,
        quality: quality || '4K',
        runtime: runtime ? parseInt(runtime) : null,
        genres: genres ? JSON.stringify(genres) : null,
        overview,
        tmdbId: tmdbId ? parseInt(tmdbId) : null,
        progress: progress ? parseInt(progress) : 0,
      },
    });

    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error creating movie:', error);
    return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 });
  }
}
