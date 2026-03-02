import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPopularTVShows, discoverTVShows, getTVGenres } from '@/lib/tmdb';

// GET - Fetch TV shows (from database or TMDB)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'database';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const genre = searchParams.get('genre');
    const year = searchParams.get('year');
    const tmdbId = searchParams.get('tmdbId');

    // Get single TV show by TMDB ID from database
    if (tmdbId && source === 'database') {
      const tvShow = await db.tVShow.findFirst({
        where: { tmdbId: parseInt(tmdbId) }
      });
      if (tvShow) {
        return NextResponse.json({
          tvShow: {
            ...tvShow,
            genres: tvShow.genres ? JSON.parse(tvShow.genres) : [],
          }
        });
      }
      return NextResponse.json({ tvShow: null });
    }

    if (source === 'tmdb') {
      // Fetch from TMDB
      if (genre || year) {
        const genreId = genre ? await getGenreId(genre, 'tv') : undefined;
        const result = await discoverTVShows({
          page,
          with_genres: genreId,
          first_air_date_year: year || undefined,
        });
        return NextResponse.json({
          tvShows: result.results.map(show => ({
            id: show.id.toString(),
            tmdbId: show.id,
            title: show.name,
            poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
            backdrop: show.backdrop_path ? `https://image.tmdb.org/t/p/w780${show.backdrop_path}` : null,
            year: show.first_air_date ? parseInt(show.first_air_date.split('-')[0]) : null,
            rating: show.vote_average,
            overview: show.overview,
            genres: show.genre_ids,
            seasons: show.number_of_seasons || 1,
          })),
          totalPages: result.total_pages,
          currentPage: page,
        });
      } else {
        const result = await getPopularTVShows(page);
        return NextResponse.json({
          tvShows: result.results.map(show => ({
            id: show.id.toString(),
            tmdbId: show.id,
            title: show.name,
            poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
            backdrop: show.backdrop_path ? `https://image.tmdb.org/t/p/w780${show.backdrop_path}` : null,
            year: show.first_air_date ? parseInt(show.first_air_date.split('-')[0]) : null,
            rating: show.vote_average,
            overview: show.overview,
            genres: show.genre_ids,
            seasons: show.number_of_seasons || 1,
          })),
          totalPages: result.total_pages,
          currentPage: page,
        });
      }
    }

    // Fetch from database
    const tvShows = await db.tVShow.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await db.tVShow.count();

    return NextResponse.json({
      tvShows: tvShows.map(show => ({
        ...show,
        genres: show.genres ? JSON.parse(show.genres) : [],
      })),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TV shows' },
      { status: 500 }
    );
  }
}

// POST - Create a new TV show
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, poster, backdrop, year, rating, quality, seasons, genres, overview, tmdbId } = body;

    // Check if TV show already exists
    if (tmdbId) {
      const existing = await db.tVShow.findFirst({
        where: { tmdbId: parseInt(tmdbId) }
      });
      if (existing) {
        return NextResponse.json(existing);
      }
    }

    const tvShow = await db.tVShow.create({
      data: {
        title,
        poster,
        backdrop,
        year: year ? parseInt(year) : null,
        rating: rating ? parseFloat(rating) : null,
        quality: quality || null,
        seasons: seasons ? parseInt(seasons) : null,
        genres: genres ? JSON.stringify(genres) : null,
        overview,
        tmdbId: tmdbId ? parseInt(tmdbId) : null,
      },
    });

    return NextResponse.json(tvShow);
  } catch (error) {
    console.error('Error creating TV show:', error);
    return NextResponse.json(
      { error: 'Failed to create TV show' },
      { status: 500 }
    );
  }
}

async function getGenreId(genreName: string, type: string): Promise<string | undefined> {
  const genres = type === 'tv' ? await getTVGenres() : [];
  const genre = genres.find(g => g.name.toLowerCase() === genreName.toLowerCase());
  return genre?.id?.toString();
}
