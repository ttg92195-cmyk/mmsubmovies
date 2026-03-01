import { NextRequest, NextResponse } from 'next/server'

const TMDB_API_KEY = '2e928cd76f7f5ae46f6e022f5dcc2612'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'movie' // 'movie' or 'tv'
    const year = searchParams.get('year')
    const genre = searchParams.get('genre')
    const page = searchParams.get('page') || '1'
    const sortBy = searchParams.get('sort_by') || 'popularity.desc'

    const endpoint = type === 'tv' ? 'discover/tv' : 'discover/movie'
    
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      page,
      sort_by: sortBy,
    })

    if (year) {
      if (type === 'tv') {
        params.append('first_air_date_year', year)
      } else {
        params.append('primary_release_year', year)
      }
    }

    if (genre) {
      params.append('with_genres', genre)
    }

    const response = await fetch(`${TMDB_BASE_URL}/${endpoint}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch from TMDB')
    }

    const data = await response.json()

    // Transform results
    const results = data.results.map((item: any) => ({
      tmdbId: item.id,
      title: item.title || item.name,
      overview: item.overview,
      posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
      backdropUrl: item.backdrop_path ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}` : null,
      rating: item.vote_average || 0,
      year: parseInt((item.release_date || item.first_air_date || '').substring(0, 4)) || 0,
      genre: '', // Will be populated from genre_ids if needed
      genreIds: item.genre_ids || [],
      language: item.original_language,
      isSeries: type === 'tv',
    }))

    return NextResponse.json({
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      results,
    })
  } catch (error) {
    console.error('TMDB Discover error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from TMDB' },
      { status: 500 }
    )
  }
}
