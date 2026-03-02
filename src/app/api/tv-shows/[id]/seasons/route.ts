import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTVShowDetails, getTVShowSeasonDetails } from '@/lib/tmdb';

interface EpisodeData {
  id: string;
  episodeNumber: number;
  name: string | null;
  overview: string | null;
  stillPath: string | null;
  airDate: string | null;
  runtime: number | null;
}

interface SeasonData {
  id: string;
  seasonNumber: number;
  name: string | null;
  episodeCount: number;
  overview: string | null;
  poster: string | null;
  airDate: string | null;
  episodes: EpisodeData[];
}

// GET - Fetch seasons for a TV show
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // First check if we have seasons in the database
    const existingSeasons = await db.tVSeason.findMany({
      where: { tvShowId: id },
      include: {
        episodes: {
          orderBy: { episodeNumber: 'asc' }
        }
      },
      orderBy: { seasonNumber: 'asc' }
    });

    if (existingSeasons.length > 0) {
      return NextResponse.json({ seasons: existingSeasons });
    }

    // If no seasons in database, try to fetch from TMDB
    const tvShow = await db.tVShow.findUnique({
      where: { id }
    });

    if (!tvShow || !tvShow.tmdbId) {
      return NextResponse.json({ seasons: [] });
    }

    // Fetch TV show details from TMDB
    const tmdbShow = await getTVShowDetails(tvShow.tmdbId);
    
    if (!tmdbShow || !tmdbShow.seasons) {
      return NextResponse.json({ seasons: [] });
    }

    // Create seasons and episodes in database
    const seasonsData: SeasonData[] = [];
    
    for (const seasonInfo of tmdbShow.seasons) {
      // Skip "Specials" (season 0) if no episodes
      if (seasonInfo.season_number === 0 && seasonInfo.episode_count === 0) continue;
      
      // Create season
      const season = await db.tVSeason.create({
        data: {
          tvShowId: id,
          seasonNumber: seasonInfo.season_number,
          name: seasonInfo.name,
          episodeCount: seasonInfo.episode_count,
          overview: seasonInfo.overview,
          poster: seasonInfo.poster_path ? `https://image.tmdb.org/t/p/w500${seasonInfo.poster_path}` : null,
          airDate: seasonInfo.air_date,
        }
      });

      // Fetch season details to get episodes
      const seasonDetails = await getTVShowSeasonDetails(tvShow.tmdbId, seasonInfo.season_number);
      
      const episodes: EpisodeData[] = [];
      if (seasonDetails && seasonDetails.episodes) {
        for (const ep of seasonDetails.episodes) {
          const episode = await db.tVEpisode.create({
            data: {
              seasonId: season.id,
              episodeNumber: ep.episode_number,
              name: ep.name,
              overview: ep.overview,
              stillPath: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
              airDate: ep.air_date,
              runtime: ep.runtime,
            }
          });
          episodes.push({
            id: episode.id,
            episodeNumber: episode.episodeNumber,
            name: episode.name,
            overview: episode.overview,
            stillPath: episode.stillPath,
            airDate: episode.airDate,
            runtime: episode.runtime,
          });
        }
      }

      seasonsData.push({
        id: season.id,
        seasonNumber: season.seasonNumber,
        name: season.name,
        episodeCount: season.episodeCount,
        overview: season.overview,
        poster: season.poster,
        airDate: season.airDate,
        episodes
      });
    }

    return NextResponse.json({ seasons: seasonsData });
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return NextResponse.json({ seasons: [] });
  }
}
