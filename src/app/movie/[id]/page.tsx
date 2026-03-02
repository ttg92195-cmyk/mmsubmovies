'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Clock, Download, ArrowLeft, Plus, Trash2, Edit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';

interface MovieData {
  id: string;
  title: string;
  poster: string | null;
  backdrop: string | null;
  year: number | null;
  rating: number;
  genres: number[] | string[];
  overview: string;
  runtime: number;
  quality: string;
  tmdbId: number;
  savedToDb: boolean;
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
};

const genreColors: Record<number, string> = {
  28: '#ef4444', 12: '#f97316', 16: '#eab308', 35: '#22c55e', 80: '#06b6d4',
  99: '#3b82f6', 18: '#8b5cf6', 10751: '#a855f7', 14: '#ec4899', 36: '#f43f5e',
  27: '#ef4444', 10402: '#f97316', 9648: '#eab308', 10749: '#22c55e', 878: '#06b6d4',
  10770: '#3b82f6', 53: '#8b5cf6', 10752: '#a855f7', 37: '#ec4899',
};

const resolutionColors: Record<string, string> = {
  '4K': 'bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-bold',
  '1080p': 'bg-gradient-to-r from-gray-300 to-gray-400 text-black font-bold',
  '720p': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold',
  '480p': 'bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold',
};

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<MovieData | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([]);
  const [servers, setServers] = useState<ServerData[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editQuality, setEditQuality] = useState('');
  
  const [newDownload, setNewDownload] = useState({ serverName: '', url: '', size: '', resolution: '' });
  const [showAddServer, setShowAddServer] = useState(false);
  const [newServerName, setNewServerName] = useState('');

  const fetchMovie = useCallback(async () => {
    setIsLoading(true);
    try {
      const dbRes = await fetch(`/api/movies?tmdbId=${movieId}`);
      const dbData = await dbRes.json();
      
      if (dbData.movie) {
        const m = dbData.movie;
        setMovie({
          id: m.id,
          title: m.title,
          poster: m.poster,
          backdrop: m.backdrop,
          year: m.year,
          rating: m.rating || 0,
          genres: m.genres ? JSON.parse(m.genres) : [],
          overview: m.overview || '',
          runtime: m.runtime || 0,
          quality: m.quality || '',
          tmdbId: m.tmdbId,
          savedToDb: true,
        });
        setEditQuality(m.quality || '');
        const linksRes = await fetch(`/api/downloads?movieId=${m.id}`);
        const linksData = await linksRes.json();
        setDownloadLinks(linksData.links || []);
      } else {
        const tmdbRes = await fetch(`/api/movies?source=tmdb&tmdbId=${movieId}`);
        const tmdbData = await tmdbRes.json();
        if (tmdbData.movie) {
          setMovie({
            id: tmdbData.movie.id,
            title: tmdbData.movie.title,
            poster: tmdbData.movie.poster,
            backdrop: tmdbData.movie.backdrop,
            year: tmdbData.movie.year,
            rating: tmdbData.movie.rating || 0,
            genres: tmdbData.movie.genres || [],
            overview: tmdbData.movie.overview || '',
            runtime: tmdbData.movie.runtime || 0,
            quality: '',
            tmdbId: tmdbData.movie.tmdbId,
            savedToDb: false,
          });
          setDownloadLinks([]);
        }
      }
    } catch (error) {
      console.error('Error fetching movie:', error);
    }
    setIsLoading(false);
  }, [movieId]);

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
      await fetchMovie();
      await checkAuth();
      await fetchServers();
    })();
  }, [movieId]);

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
    if (!movie) return;
    try {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: movie.title,
          poster: movie.poster,
          backdrop: movie.backdrop,
          year: movie.year,
          rating: movie.rating,
          quality: editQuality || '4K',
          runtime: movie.runtime,
          genres: movie.genres,
          overview: movie.overview,
          tmdbId: movie.tmdbId,
        }),
      });
      if (res.ok) {
        toast.success('Saved to database!');
        fetchMovie();
      }
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleSaveEdit = async () => {
    if (!movie || !movie.savedToDb) return;
    try {
      const res = await fetch(`/api/movies/${movie.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality: editQuality }),
      });
      if (res.ok) {
        setMovie({ ...movie, quality: editQuality });
        setIsEditing(false);
        toast.success('Updated!');
      }
    } catch {
      toast.error('Failed to update');
    }
  };

  const addDownloadLink = async () => {
    if (!movie || !movie.savedToDb) {
      toast.error('Please save movie to database first');
      return;
    }
    if (!newDownload.serverName || !newDownload.url) {
      toast.error('Server and URL are required');
      return;
    }
    try {
      const res = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: movie.id,
          ...newDownload,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDownloadLinks([...downloadLinks, data]);
        setNewDownload({ serverName: '', url: '', size: '', resolution: '' });
        toast.success('Download link added!');
      }
    } catch {
      toast.error('Failed to add link');
    }
  };

  const deleteDownloadLink = async (linkId: string) => {
    try {
      const res = await fetch(`/api/downloads/${linkId}`, { method: 'DELETE' });
      if (res.ok) {
        setDownloadLinks(downloadLinks.filter(l => l.id !== linkId));
        toast.success('Deleted!');
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const deleteMovie = async () => {
    if (!movie || !movie.savedToDb) return;
    if (!confirm('Are you sure you want to delete this movie?')) return;
    try {
      const res = await fetch(`/api/movies/${movie.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Movie deleted!');
        router.push('/');
      }
    } catch {
      toast.error('Failed to delete');
    }
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

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
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
          src={movie.backdrop || movie.poster || '/placeholder-backdrop.jpg'} 
          alt={movie.title}
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
              src={movie.poster || '/placeholder-poster.jpg'} 
              alt={movie.title}
              className="w-full rounded-lg shadow-2xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-gray-400">{movie.year || 'N/A'}</span>
              {movie.runtime && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                </>
              )}
              <span className="text-gray-600">•</span>
              <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{movie.rating?.toFixed(1) || 'N/A'}</span>
              </div>
              {(movie.quality || editQuality) && (
                <span className={`px-3 py-1 rounded text-sm ${resolutionColors[movie.quality || editQuality] || 'bg-red-600'}`}>
                  {movie.quality || editQuality}
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {getGenreNamesList(Array.isArray(movie.genres) ? movie.genres : []).map((name, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 rounded-full text-sm bg-[#1a1e2e] border border-red-900/30"
                  style={{ borderLeftColor: genreColors[Number(movie.genres?.[i])] || '#ef4444', borderLeftWidth: 3 }}
                >
                  {name}
                </span>
              ))}
            </div>

            {/* Admin Controls */}
            {isAuthenticated && (
              <div className="flex flex-wrap gap-2 mb-4">
                {!movie.savedToDb ? (
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
                    <Button onClick={deleteMovie} variant="destructive">
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
          <p className="text-gray-300 leading-relaxed">{movie.overview || 'No overview available.'}</p>
        </div>

        {/* Download Links */}
        <div className="mt-8 pb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-red-500" />
            Download Links
          </h2>

          {downloadLinks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1a1e2e]">
                    <th className="p-3 text-left">No</th>
                    <th className="p-3 text-left">Server</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Size</th>
                    <th className="p-3 text-left">Resolution</th>
                    {isAuthenticated && <th className="p-3 text-left">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {downloadLinks.map((link, i) => (
                    <tr key={link.id} className="border-b border-red-900/20 hover:bg-[#1a1e2e]/50">
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3">
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 transition-colors"
                        >
                          {link.serverName}
                        </a>
                      </td>
                      <td className="p-3">{movie.title}</td>
                      <td className="p-3">{link.size || '-'}</td>
                      <td className="p-3">
                        {link.resolution && (
                          <span className={`px-2 py-0.5 rounded text-xs ${resolutionColors[link.resolution] || 'bg-gray-600'}`}>
                            {link.resolution}
                          </span>
                        )}
                      </td>
                      {isAuthenticated && (
                        <td className="p-3">
                          <Button size="sm" variant="ghost" onClick={() => deleteDownloadLink(link.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-[#1a1e2e] rounded-lg">
              <Download className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-gray-400">No download links available</p>
            </div>
          )}

          {/* Add Download Form */}
          {isAuthenticated && movie.savedToDb && (
            <div className="mt-4 p-4 bg-[#1a1e2e] rounded-lg border border-red-900/20">
              <h3 className="font-medium mb-3 text-red-400">Add Download Link</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Server</Label>
                  <div className="flex gap-1">
                    <Select value={newDownload.serverName} onValueChange={(v) => setNewDownload({...newDownload, serverName: v})}>
                      <SelectTrigger className="bg-[#12151c] h-9 flex-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#12151c]">
                        {servers.map(s => (
                          <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => setShowAddServer(!showAddServer)} className="h-9 px-2">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {showAddServer && (
                    <div className="mt-2 flex gap-1">
                      <Input value={newServerName} onChange={(e) => setNewServerName(e.target.value)} placeholder="Server name" className="bg-[#12151c] h-8 flex-1" />
                      <Button size="sm" onClick={addServer} className="h-8 bg-red-600">Add</Button>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-xs mb-1 block">URL</Label>
                  <Input value={newDownload.url} onChange={(e) => setNewDownload({...newDownload, url: e.target.value})} placeholder="https://..." className="bg-[#12151c] h-9" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Size</Label>
                  <Input value={newDownload.size} onChange={(e) => setNewDownload({...newDownload, size: e.target.value})} placeholder="1.5GB" className="bg-[#12151c] h-9" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Resolution</Label>
                  <Select value={newDownload.resolution} onValueChange={(v) => setNewDownload({...newDownload, resolution: v})}>
                    <SelectTrigger className="bg-[#12151c] h-9">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#12151c]">
                      <SelectItem value="4K">4K</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="480p">480p</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={addDownloadLink} className="w-full bg-red-600 hover:bg-red-700 h-9">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
