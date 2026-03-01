import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const TMDB_API_KEY = process.env.TMDB_API_KEY || '2e928cd76f7f5ae46f6e022f5dcc2612'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const type = searchParams.get('type') || 'movie' // movie or tv
    const year = searchParams.get('year')
    const genre = searchParams.get('genre')
    const page = searchParams.get('page') || '1'
    const query = searchParams.get('query')

    let url = ''

    if (action === 'search' && query) {
      url = `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    } else if (action === 'discover') {
      url = `${TMDB_BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}&page=${page}&sort_by=popularity.desc`
      if (year) {
        url += type === 'movie' ? `&primary_release_year=${year}` : `&first_air_date_year=${year}`
      }
      if (genre) {
        url += `&with_genres=${genre}`
      }
    } else if (action === 'genres') {
      url = `${TMDB_BASE_URL}/genre/${type}/list?api_key=${TMDB_API_KEY}`
    } else {
      url = `${TMDB_BASE_URL}/${type}/popular?api_key=${TMDB_API_KEY}&page=${page}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.error('TMDB API error:', response.status, response.statusText)
      return NextResponse.json({ 
        success: false, 
        message: `TMDB API error: ${response.status}`,
        data: { results: [], genres: [] }
      })
    }
    
    const data = await response.json()

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('TMDB API error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'TMDB API error',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { results: [], genres: [] }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tmdbId, type } = body // type: 'movie' or 'tv'

    if (!tmdbId || !type) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing tmdbId or type',
        data: null
      })
    }

    // Fetch detailed info from TMDB
    const detailUrl = `${TMDB_BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
    
    const response = await fetch(detailUrl, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.error('TMDB detail API error:', response.status)
      return NextResponse.json({ 
        success: false, 
        message: `TMDB API error: ${response.status}`,
        data: null
      })
    }
    
    const data = await response.json()

    // Generate placeholder download links with quality options
    const generateDownloadLinks = (title: string) => {
      const encodedTitle = encodeURIComponent(title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '+'))
      return [
        { quality: '4K', url: `https://example.com/download/${encodedTitle}/4k`, source: 'Placeholder' },
        { quality: '1080p', url: `https://example.com/download/${encodedTitle}/1080p`, source: 'Placeholder' },
        { quality: '720p', url: `https://example.com/download/${encodedTitle}/720p`, source: 'Placeholder' },
        { quality: '480p', url: `https://example.com/download/${encodedTitle}/480p`, source: 'Placeholder' },
      ]
    }

    const title = data.title || data.name || 'Unknown'

    // Parse year safely
    const dateStr = data.release_date || data.first_air_date || ''
    let year = 2024
    if (dateStr && dateStr.length >= 4) {
      const parsed = parseInt(dateStr.substring(0, 4))
      if (!isNaN(parsed) && parsed > 1900 && parsed < 2100) {
        year = parsed
      }
    }

    // Transform for our database
    const transformed = {
      title,
      overview: data.overview || '',
      posterUrl: data.poster_path ? `${TMDB_IMAGE_BASE}/w500${data.poster_path}` : null,
      backdropUrl: data.backdrop_path ? `${TMDB_IMAGE_BASE}/original${data.backdrop_path}` : null,
      rating: data.vote_average || 0,
      year,
      duration: data.runtime || (data.episode_run_time?.[0]) || null,
      genre: data.genres?.map((g: { name: string }) => g.name).join(', ') || '',
      language: data.original_language || 'en',
      isSeries: type === 'tv',
      isTrending: true,
      isIconic: false,
      cast: data.credits?.cast?.slice(0, 10).map((c: { name: string; character: string; profile_path: string }) => ({
        name: c.name || 'Unknown',
        character: c.character || '',
        profileUrl: c.profile_path ? `${TMDB_IMAGE_BASE}/w185${c.profile_path}` : null,
      })) || [],
      // Add placeholder download links for movies
      downloadLinks: type === 'movie' ? generateDownloadLinks(title) : [],
      seriesData: type === 'tv' ? {
        status: data.status || 'Ongoing',
        seasons: data.seasons?.filter((s: { season_number: number }) => s.season_number > 0).map((s: { season_number: number; episode_count: number }) => ({
          seasonNumber: s.season_number,
          episodes: Array.from({ length: s.episode_count || 1 }, (_, i) => ({
            episodeNumber: i + 1,
            title: `Episode ${i + 1}`,
          }))
        })) || []
      } : null,
    }

    return NextResponse.json({ success: true, data: transformed })
  } catch (error) {
    console.error('TMDB import error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'TMDB import error',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    })
  }
}
