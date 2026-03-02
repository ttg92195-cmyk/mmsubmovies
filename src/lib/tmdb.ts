const TMDB_API_KEY = process.env.TMDB_API_KEY || '2e928cd76f7f5ae46f6e022f5dcc2612';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
  runtime?: number;
  genres?: { id: number; name: string }[];
}

export interface TMDBTVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
  number_of_seasons?: number;
  seasons?: TMDBSeason[];
}

export interface TMDBSeason {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string;
  episode_count: number;
}

export interface TMDBEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  runtime: number;
}

export interface TMDBSeasonDetails {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string;
  episodes: TMDBEpisode[];
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBGenresResponse {
  genres: TMDBGenre[];
}

export const getPosterUrl = (path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string => {
  if (!path) return '/placeholder-poster.jpg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w780'): string => {
  if (!path) return '/placeholder-backdrop.jpg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const tmdbFetch = async (endpoint: string, params: Record<string, string> = {}): Promise<unknown> => {
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params,
  });

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams.toString()}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status}`);
  }

  return response.json();
};

export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'week'): Promise<TMDBMovie[]> => {
  const data = await tmdbFetch(`/trending/movie/${timeWindow}`) as { results: TMDBMovie[] };
  return data.results;
};

export const getTrendingTVShows = async (timeWindow: 'day' | 'week' = 'week'): Promise<TMDBTVShow[]> => {
  const data = await tmdbFetch(`/trending/tv/${timeWindow}`) as { results: TMDBTVShow[] };
  return data.results;
};

export const getPopularMovies = async (page: number = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> => {
  return tmdbFetch('/movie/popular', { page: page.toString() }) as Promise<{ results: TMDBMovie[]; total_pages: number }>;
};

export const getPopularTVShows = async (page: number = 1): Promise<{ results: TMDBTVShow[]; total_pages: number }> => {
  return tmdbFetch('/tv/popular', { page: page.toString() }) as Promise<{ results: TMDBTVShow[]; total_pages: number }>;
};

export const getMovieGenres = async (): Promise<TMDBGenre[]> => {
  const data = await tmdbFetch('/genre/movie/list') as TMDBGenresResponse;
  return data.genres;
};

export const getTVGenres = async (): Promise<TMDBGenre[]> => {
  const data = await tmdbFetch('/genre/tv/list') as TMDBGenresResponse;
  return data.genres;
};

export const discoverMovies = async (params: {
  page?: number;
  with_genres?: string;
  primary_release_year?: string;
  sort_by?: string;
}): Promise<{ results: TMDBMovie[]; total_pages: number }> => {
  const searchParams: Record<string, string> = {
    page: (params.page || 1).toString(),
    sort_by: params.sort_by || 'popularity.desc',
  };
  
  if (params.with_genres) searchParams.with_genres = params.with_genres;
  if (params.primary_release_year) searchParams.primary_release_year = params.primary_release_year;

  return tmdbFetch('/discover/movie', searchParams) as Promise<{ results: TMDBMovie[]; total_pages: number }>;
};

export const discoverTVShows = async (params: {
  page?: number;
  with_genres?: string;
  first_air_date_year?: string;
  sort_by?: string;
}): Promise<{ results: TMDBTVShow[]; total_pages: number }> => {
  const searchParams: Record<string, string> = {
    page: (params.page || 1).toString(),
    sort_by: params.sort_by || 'popularity.desc',
  };
  
  if (params.with_genres) searchParams.with_genres = params.with_genres;
  if (params.first_air_date_year) searchParams.first_air_date_year = params.first_air_date_year;

  return tmdbFetch('/discover/tv', searchParams) as Promise<{ results: TMDBTVShow[]; total_pages: number }>;
};

export const getMovieDetails = async (movieId: number): Promise<TMDBMovie & { runtime: number }> => {
  return tmdbFetch(`/movie/${movieId}`) as Promise<TMDBMovie & { runtime: number }>;
};

export const getTVShowDetails = async (tvId: number): Promise<TMDBTVShow & { number_of_seasons: number; seasons: TMDBSeason[] }> => {
  return tmdbFetch(`/tv/${tvId}`) as Promise<TMDBTVShow & { number_of_seasons: number; seasons: TMDBSeason[] }>;
};

export const getTVShowSeasonDetails = async (tvId: number, seasonNumber: number): Promise<TMDBSeasonDetails> => {
  return tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`) as Promise<TMDBSeasonDetails>;
};

export const searchMovies = async (query: string, page: number = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> => {
  return tmdbFetch('/search/movie', { query, page: page.toString() }) as Promise<{ results: TMDBMovie[]; total_pages: number }>;
};

export const searchTVShows = async (query: string, page: number = 1): Promise<{ results: TMDBTVShow[]; total_pages: number }> => {
  return tmdbFetch('/search/tv', { query, page: page.toString() }) as Promise<{ results: TMDBTVShow[]; total_pages: number }>;
};
