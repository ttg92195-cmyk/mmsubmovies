'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Download, ArrowLeft, Plus, Trash2, Edit, Save, ChevronDown, ChevronUp, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';

interface TVShowData {
  id: string;
  title: string;
  poster: string | null;
  backdrop: string | null;
  year: number | null;
  rating: number;
  genres: number[] | string[];
  overview: string;
  seasons: number;
  quality: string;
  tmdbId: number;
  savedToDb: boolean;
}

interface Season {
  id: string;
  seasonNumber: number;
  name: string | null;
  episodeCount: number;
  episodes: Episode[];
}

interface Episode {
  id: string;
  episodeNumber: number;
  name: string | null;
  stillPath: string | null;
  airDate: string | null;
  runtime: number | null;
}

interface DownloadLink {
  id: string;
  serverName: string;
  url: string;
  size: string;
  resolution: string;
}

interface ServerData {
  id: string;
  name: string;
  color: string;
}

const genreNames: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics',
};

const genreColors: Record<number, string> = {
  28: '#ef4444', 12: '#f97316', 16: '#eab308', 35: '#22c55e', 80: '#06b6d4',
  99: '#3b82f6', 18: '#8b5cf6', 10751: '#a855f7', 14: '#ec4899', 36: '#f43f5e',
  27: '#ef4444', 10402: '#f97316', 9648: '#eab308', 10749: '#22c55e', 878: '#06b6d4',
};

const resolutionColors: Record<string, string> = {
  '4K': 'bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-bold',
  '1080p': 'bg-gradient-to-r from-gray-300 to-gray-400 text-black font-bold',
  '720p': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold',
  '480p': 'bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold',
};

export default function TVDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tvId = params.id as string;

  const [tvShow, setTVShow] = useState<TVShowData | null>(null);
  const [tvSeasons, setTVSeasons] = useState<Season[]>([]);
  const [episodeDownloads, setEpisodeDownloads] = useState<Record<string, DownloadLink[]>>({});
  const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set());
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<string>>(new Set());
  const [servers, setServers] = useState<ServerData[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editQuality, setEditQuality] = useState('');
  
  const [newDownload, setNewDownload] = useState({ serverName: '', url: '', size: '', resolution: '' });
  const [showAddServer, setShowAddServer] = useState(false);
  const [newServerName, setNewServerName] = useState('');

  const fetchTVShow = useCallback(async () => {
    setIsLoading(true);
    try {
      const dbRes = await fetch(`/api/tv-shows?tmdbId=${tvId}`);
      const dbData = await dbRes.json();
      
      if (dbData.tvShow) {
        const t = dbData.tvShow;
        setTVShow({
          id: t.id,
          title: t.title,
          poster: t.poster,
          backdrop: t.backdrop,
          year: t.year,
          rating: t.rating || 0,
          genres: t.genres ? JSON.parse(t.genres) : [],
          overview: t.overview || '',
          seasons: t.seasons || 0,
          quality: t.quality || '',
          tmdbId: t.tmdbId,
          savedToDb: true,
        });
        setEditQuality(t.quality || '');
        const seasonsRes = await fetch(`/api/tv-shows/${t.id}/seasons`);
        const seasonsData = await seasonsRes.json();
        setTVSeasons(seasonsData.seasons || []);
      } else {
        const tmdbRes = await fetch(`/api/tv-shows?source=tmdb&tmdbId=${tvId}`);
        const tmdbData = await tmdbRes.json();
        if (tmdbData.tvShow) {
          setTVShow({
            id: tmdbData.tvShow.id,
            title: tmdbData.tvShow.title,
            poster: tmdbData.tvShow.poster,
            backdrop: tmdbData.tvShow.backdrop,
            year: tmdbData.tvShow.year,
            rating: tmdbData.tvShow.rating || 0,
            genres: tmdbData.tvShow.genres || [],
            overview: tmdbData.tvShow.overview || '',
            seasons: tmdbData.tvShow.seasons || 0,
            quality: '',
            tmdbId: tmdbData.tvShow.tmdbId,
            savedToDb: false,
          });
          setTVSeasons([]);
        }
      }
    } catch (error) {
      console.error('Error fetching TV show:', error);
    }
    setIsLoading(false);
  }, [tvId]);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const fetchServers = useCallback(async () => {
    try {
      const res = await fetch('/api/servers');
      const data = await res.json();
      setServers(data.servers || []);
    } catch {
      setServers([
        { id: '1', name: 'Megaup', color: '#ef4444' },
        { id: '2', name: 'Mega', color: '#3b82f6' },
        { id: '3', name: 'Yoteshin', color: '#22c55e' },
      ]);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await fetchTVShow();
      await checkAuth();
      await fetchServers();
    })();
  }, [tvId]);

  const fetchEpisodeDownloads = async (episodeId: string) => {
    try {
      const res = await fetch(`/api/downloads?episodeId=${episodeId}`);
      const data = await res.json();
      setEpisodeDownloads(prev => ({ ...prev, [episodeId]: data.links || [] }));
    } catch {
      setEpisodeDownloads(prev => ({ ...prev, [episodeId]: [] }));
    }
  };

  const addServer = async () => {
    if (!newServerName.trim()) return;
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newServerName, color: '#ef4444' }),
      });
      if (res.ok) {
        const data = await res.json();
        setServers([...servers, data]);
        setNewServerName('');
        setShowAddServer(false);
        toast.success('Server added!');
      }
    } catch {
      toast.error('Failed to add server');
    }
  };

  const saveToDatabase = async () => {
    if (!tvShow) return;
    try {
      const res = await fetch('/api/tv-shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: tvShow.title,
          poster: tvShow.poster,
          backdrop: tvShow.backdrop,
          year: tvShow.year,
          rating: tvShow.rating,
          quality: editQuality || '4K',
          seasons: tvShow.seasons,
          genres: tvShow.genres,
          overview: tvShow.overview,
          tmdbId: tvShow.tmdbId,
        }),
      });
      if (res.ok) {
        toast.success('Saved to database!');
        fetchTVShow();
      }
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleSaveEdit = async () => {
    if (!tvShow || !tvShow.savedToDb) return;
    try {
      const res = await fetch(`/api/tv-shows/${tvShow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality: editQuality }),
      });
      if (res.ok) {
        setTVShow({ ...tvShow, quality: editQuality });
        setIsEditing(false);
        toast.success('Updated!');
      }
    } catch {
      toast.error('Failed to update');
    }
  };

  const deleteTVShow = async () => {
    if (!tvShow || !tvShow.savedToDb) return;
    if (!confirm('Are you sure you want to delete this TV show?')) return;
    try {
      const res = await fetch(`/api/tv-shows/${tvShow.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('TV show deleted!');
        router.push('/');
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const addDownloadLink = async (episodeId: string) => {
    if (!newDownload.serverName || !newDownload.url) {
      toast.error('Server and URL are required');
      return;
    }
    try {
      const res = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId,
          ...newDownload,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEpisodeDownloads(prev => ({
          ...prev,
          [episodeId]: [...(prev[episodeId] || []), data]
        }));
        setNewDownload({ serverName: '', url: '', size: '', resolution: '' });
        toast.success('Download link added!');
      }
    } catch {
      toast.error('Failed to add link');
    }
  };

  const deleteDownloadLink = async (linkId: string, episodeId: string) => {
    try {
      const res = await fetch(`/api/downloads/${linkId}`, { method: 'DELETE' });
      if (res.ok) {
        setEpisodeDownloads(prev => ({
          ...prev,
          [episodeId]: (prev[episodeId] || []).filter(l => l.id !== linkId)
        }));
        toast.success('Deleted!');
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleSeason = (seasonId: string) => {
    setExpandedSeasons(prev => {
      const next = new Set(prev);
      if (next.has(seasonId)) next.delete(seasonId);
      else next.add(seasonId);
      return next;
    });
  };

  const toggleEpisode = (episodeId: string) => {
    setExpandedEpisodes(prev => {
      const next = new Set(prev);
      if (next.has(episodeId)) next.delete(episodeId);
      else {
        next.add(episodeId);
        fetchEpisodeDownloads(episodeId);
      }
      return next;
    });
  };

  const getGenreNamesList = (genreIds: number[] | string[]): string[] => 
    genreIds.map(id => genreNames[Number(id)] || '').filter(Boolean);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">TV Show not found</h1>
          <Link href="/" className="text-red-500 hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white">
      <Toaster />
      
      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/70 to-transparent z-10" />
        <img 
          src={tvShow.backdrop || tvShow.poster || '/placeholder-backdrop.jpg'} 
          alt={tvShow.title}
          className="w-full h-full object-cover"
        />
        
        <button 
          onClick={() => router.back()} 
          className="absolute top-4 left-4 z-20 bg-black/50 hover:bg-black/70 p-2 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-48 relative z-20">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Poster */}
          <div className="w-48 md:w-64 mx-auto md:mx-0 shrink-0">
            <img 
              src={tvShow.poster || '/placeholder-poster.jpg'} 
              alt={tvShow.title}
              className="w-full rounded-lg shadow-2xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">{tvShow.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-gray-400">{tvShow.year || 'N/A'}</span>
              {tvShow.seasons > 0 && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="bg-red-600 px-2 py-1 rounded text-sm font-medium">
                    {tvShow.seasons} Season{tvShow.seasons > 1 ? 's' : ''}
                  </span>
                </>
              )}
              <span className="text-gray-600">•</span>
              <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{tvShow.rating?.toFixed(1) || 'N/A'}</span>
              </div>
              {(tvShow.quality || editQuality) && (
                <span className={`px-3 py-1 rounded text-sm ${resolutionColors[tvShow.quality || editQuality] || 'bg-red-600'}`}>
                  {tvShow.quality || editQuality}
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {getGenreNamesList(Array.isArray(tvShow.genres) ? tvShow.genres : []).map((name, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 rounded-full text-sm bg-[#1a1e2e] border border-red-900/30"
                  style={{ borderLeftColor: genreColors[Number(tvShow.genres?.[i])] || '#ef4444', borderLeftWidth: 3 }}
                >
                  {name}
                </span>
              ))}
            </div>

            {/* Admin Controls */}
            {isAuthenticated && (
              <div className="flex flex-wrap gap-2 mb-4">
                {!tvShow.savedToDb ? (
                  <Button onClick={saveToDatabase} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" /> Save to Database
                  </Button>
                ) : (
                  <>
                    {isEditing ? (
                      <>
                        <Select value={editQuality} onValueChange={setEditQuality}>
                          <SelectTrigger className="w-32 bg-[#1a1e2e]">
                            <SelectValue placeholder="Quality" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1e2e]">
                            <SelectItem value="4K">4K</SelectItem>
                            <SelectItem value="1080p">1080p</SelectItem>
                            <SelectItem value="720p">720p</SelectItem>
                            <SelectItem value="480p">480p</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                          <Save className="w-4 h-4 mr-2" /> Save
                        </Button>
                        <Button onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} variant="outline">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                    )}
                    <Button onClick={deleteTVShow} variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Overview */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-3">Overview</h2>
          <p className="text-gray-300 leading-relaxed">{tvShow.overview || 'No overview available.'}</p>
        </div>

        {/* Seasons and Episodes */}
        <div className="mt-8 pb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Tv className="w-5 h-5 text-red-500" />
            Seasons & Episodes
          </h2>

          {tvSeasons.length > 0 ? (
            <div className="space-y-2">
              {tvSeasons.map((season) => (
                <div key={season.id} className="bg-[#1a1e2e] rounded-lg overflow-hidden">
                  <div 
                    onClick={() => toggleSeason(season.id)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#252a3d]"
                  >
                    <div className="flex items-center gap-3">
                      {expandedSeasons.has(season.id) ? (
                        <ChevronUp className="w-5 h-5 text-red-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-red-400" />
                      )}
                      <span className="font-medium">Season {season.seasonNumber}</span>
                      {season.name && <span className="text-gray-400">- {season.name}</span>}
                    </div>
                    <span className="text-gray-400 text-sm">
                      {season.episodes?.length || season.episodeCount} episodes
                    </span>
                  </div>

                  {expandedSeasons.has(season.id) && season.episodes && (
                    <div className="border-t border-red-900/30">
                      {season.episodes.map((episode) => (
                        <div key={episode.id} className="border-b border-red-900/20 last:border-b-0">
                          <div 
                            onClick={() => toggleEpisode(episode.id)}
                            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#252a3d]"
                          >
                            {expandedEpisodes.has(episode.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-red-400 text-sm font-medium">
                                  E{episode.episodeNumber}
                                </span>
                                {episode.name && <span className="text-sm">{episode.name}</span>}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                {episode.airDate && <span>{episode.airDate}</span>}
                                {episode.runtime && (
                                  <>
                                    <span>•</span>
                                    <span>{episode.runtime} min</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {(episodeDownloads[episode.id]?.length || 0) > 0 && (
                              <span className="bg-red-600 rounded px-2 py-0.5 text-xs">
                                {episodeDownloads[episode.id]?.length}
                              </span>
                            )}
                          </div>

                          {expandedEpisodes.has(episode.id) && (
                            <div className="p-3 pt-0 bg-[#12151c]">
                              {(episodeDownloads[episode.id] || []).length > 0 ? (
                                <div className="overflow-x-auto mb-3">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="bg-[#1a1e2e]">
                                        <th className="p-2 text-left">Server</th>
                                        <th className="p-2 text-left">Size</th>
                                        <th className="p-2 text-left">Resolution</th>
                                        {isAuthenticated && <th className="p-2 text-left">Action</th>}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {episodeDownloads[episode.id]?.map((link) => (
                                        <tr key={link.id} className="border-b border-red-900/20">
                                          <td className="p-2">
                                            <a 
                                              href={link.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-xs"
                                            >
                                              {link.serverName}
                                            </a>
                                          </td>
                                          <td className="p-2 text-xs">{link.size || '-'}</td>
                                          <td className="p-2">
                                            {link.resolution && (
                                              <span className={`px-2 py-0.5 rounded text-xs ${resolutionColors[link.resolution] || 'bg-gray-600'}`}>
                                                {link.resolution}
                                              </span>
                                            )}
                                          </td>
                                          {isAuthenticated && (
                                            <td className="p-2">
                                              <Button size="sm" variant="ghost" onClick={() => deleteDownloadLink(link.id, episode.id)} className="text-red-400 h-6 w-6 p-0">
                                                <Trash2 className="w-3 h-3" />
                                              </Button>
                                            </td>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-gray-400 text-xs text-center py-2">No downloads</p>
                              )}

                              {isAuthenticated && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-2 bg-[#1a1e2e]/50 rounded">
                                  <Select value={newDownload.serverName} onValueChange={(v) => setNewDownload({...newDownload, serverName: v})}>
                                    <SelectTrigger className="bg-[#12151c] h-8 text-xs">
                                      <SelectValue placeholder="Server" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#12151c]">
                                      {servers.map(s => (
                                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input 
                                    value={newDownload.url} 
                                    onChange={(e) => setNewDownload({...newDownload, url: e.target.value})} 
                                    placeholder="URL" 
                                    className="bg-[#12151c] h-8 text-xs" 
                                  />
                                  <Input 
                                    value={newDownload.size} 
                                    onChange={(e) => setNewDownload({...newDownload, size: e.target.value})} 
                                    placeholder="Size" 
                                    className="bg-[#12151c] h-8 text-xs" 
                                  />
                                  <Select value={newDownload.resolution} onValueChange={(v) => setNewDownload({...newDownload, resolution: v})}>
                                    <SelectTrigger className="bg-[#12151c] h-8 text-xs">
                                      <SelectValue placeholder="Res" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#12151c]">
                                      <SelectItem value="4K">4K</SelectItem>
                                      <SelectItem value="1080p">1080p</SelectItem>
                                      <SelectItem value="720p">720p</SelectItem>
                                      <SelectItem value="480p">480p</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button size="sm" onClick={() => addDownloadLink(episode.id)} className="h-8 bg-red-600 text-xs">
                                    <Plus className="w-3 h-3 mr-1" /> Add
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-[#1a1e2e] rounded-lg">
              <Tv className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-gray-400">
                {tvShow.savedToDb ? 'No seasons available' : 'Save to database to view seasons'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
