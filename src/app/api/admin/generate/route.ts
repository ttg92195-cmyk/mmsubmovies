import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { discoverMovies, discoverTVShows, getMovieDetails, getTVShowDetails, getPosterUrl } from '@/lib/tmdb';
import { getSessionFromCookie } from '@/lib/auth';

// POST - Generate and import movies/TV shows from TMDB
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      type = 'movie', // 'movie' or 'tv'
      year, 
      genre, 
      pages = 1,
      apiKey,
    } = body;

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    try {
      if (type === 'movie') {
        // Fetch movies from TMDB
        for (let page = 1; page <= pages; page++) {
          const params: {
            page: number;
            with_genres?: string;
            primary_release_year?: string;
          } = { page };
          
          if (genre && genre !== 'all') {
            params.with_genres = genre;
          }
          if (year && year !== 'all') {
            params.primary_release_year = year;
          }

          const data = await discoverMovies(params);
          
          for (const movie of data.results) {
            try {
              // Check if movie already exists
              const existing = await db.movie.findFirst({
                where: { tmdbId: movie.id },
              });

              if (existing) {
                results.skipped++;
                continue;
              }

              // Get full movie details
              const details = await getMovieDetails(movie.id);

              // Create movie in database
              await db.movie.create({
                data: {
                  title: movie.title,
                  poster: getPosterUrl(movie.poster_path),
                  backdrop: movie.backdrop_path 
                    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` 
                    : null,
                  year: movie.release_date 
                    ? parseInt(movie.release_date.split('-')[0]) 
                    : null,
                  rating: movie.vote_average,
                  quality: '4K', // Default quality
                  runtime: details.runtime,
                  genres: JSON.stringify(movie.genre_ids),
                  overview: movie.overview,
                  tmdbId: movie.id,
                  progress: 0,
                },
              });

              results.imported++;
            } catch (err) {
              results.errors.push(`Movie ${movie.title}: ${err}`);
            }
          }
        }
      } else {
        // Fetch TV shows from TMDB
        for (let page = 1; page <= pages; page++) {
          const params: {
            page: number;
            with_genres?: string;
            first_air_date_year?: string;
          } = { page };
          
          if (genre && genre !== 'all') {
            params.with_genres = genre;
          }
          if (year && year !== 'all') {
            params.first_air_date_year = year;
          }

          const data = await discoverTVShows(params);
          
          for (const show of data.results) {
            try {
              // Check if TV show already exists
              const existing = await db.tVShow.findFirst({
                where: { tmdbId: show.id },
              });

              if (existing) {
                results.skipped++;
                continue;
              }

              // Get full TV show details
              const details = await getTVShowDetails(show.id);

              // Create TV show in database
              await db.tVShow.create({
                data: {
                  title: show.name,
                  poster: getPosterUrl(show.poster_path),
                  backdrop: show.backdrop_path 
                    ? `https://image.tmdb.org/t/p/w780${show.backdrop_path}` 
                    : null,
                  year: show.first_air_date 
                    ? parseInt(show.first_air_date.split('-')[0]) 
                    : null,
                  rating: show.vote_average,
                  quality: '4K', // Default quality
                  seasons: details.number_of_seasons || 1,
                  genres: JSON.stringify(show.genre_ids),
                  overview: show.overview,
                  tmdbId: show.id,
                },
              });

              results.imported++;
            } catch (err) {
              results.errors.push(`TV Show ${show.name}: ${err}`);
            }
          }
        }
      }
    } catch (err) {
      return NextResponse.json(
        { error: `TMDB API error: ${err}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${results.imported} ${type === 'movie' ? 'movies' : 'TV shows'}`,
      ...results,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
