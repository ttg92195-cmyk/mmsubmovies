import { NextRequest, NextResponse } from 'next/server'

const TMDB_API_KEY = '2e928cd76f7f5ae46f6e022f5dcc2612'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const type = searchParams.get('type') || 'multi' // 'movie', 'tv', or 'multi'
    const page = searchParams.get('page') || '1'

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const endpoint = type === 'multi' ? 'search/multi' : `search/${type}`
    
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query,
      page,
    })

    const response = await fetch(`${TMDB_BASE_URL}/${endpoint}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('Failed to search TMDB')
    }

    const data = await response.json()

    // Transform results
    const results = data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv' || type !== 'multi')
      .map((item: any) => ({
        tmdbId: item.id,
        title: item.title || item.name,
        overview: item.overview,
        posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
        backdropUrl: item.backdrop_path ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}` : null,
        rating: item.vote_average || 0,
        year: parseInt((item.release_date || item.first_air_date || '').substring(0, 4)) || 0,
        genre: '',
        genreIds: item.genre_ids || [],
        language: item.original_language,
        isSeries: item.media_type === 'tv' || type === 'tv',
        mediaType: item.media_type || type,
      }))

    return NextResponse.json({
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      results,
    })
  } catch (error) {
    console.error('TMDB Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search TMDB' },
      { status: 500 }
    )
  }
}
