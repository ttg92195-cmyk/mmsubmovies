'use client';

import { useState, useEffect, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Star, Play, Film, Tv, Settings, LogIn, LogOut, Clock, Calendar, Trash2, Edit, Save, Search, Download, Plus, ChevronLeft, ChevronRight, Check, ChevronDown, ChevronUp, Trash, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';

// Types
interface Movie {
  id: string | number;
  title: string;
  poster: string | null;
  backdrop?: string | null;
  year: number | null;
  rating: number;
  genres: number[] | string[];
  overview?: string;
  runtime?: number;
  quality?: string;
  seasons?: number;
  tmdbId?: number;
  type?: string;
  savedToDb?: boolean;
}

interface DownloadLink {
  id: string;
  serverName: string;
  url: string;
  size: string;
  resolution: string;
  episodeId?: string;
}

interface TVSeason {
  id: string;
  seasonNumber: number;
  name: string | null;
  episodeCount: number;
  episodes: TVEpisode[];
}

interface TVEpisode {
  id: string;
  episodeNumber: number;
  name: string | null;
  stillPath: string | null;
  airDate: string | null;
  runtime: number | null;
}

interface Genre {
  id: string;
  name: string;
  color: string;
  tmdbId?: number;
  count?: number;
  type: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  count?: number;
  type: string;
}

interface Server {
  id: string;
  name: string;
  color: string;
}

// Genre mappings
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
  10770: '#3b82f6', 53: '#8b5cf6', 10752: '#a855f7', 37: '#ec4899',
};

const resolutionColors: Record<string, string> = {
  '4K': 'bg-gradient-to-r from-yellow-500 to-amber-400 text-black',
  '1080p': 'bg-gradient-to-r from-gray-300 to-gray-400 text-black',
  '720p': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
  '480p': 'bg-gradient-to-r from-gray-600 to-gray-700 text-white',
};

const getGenreNames = (genreIds: number[] | string[]): string => 
  genreIds.map(id => genreNames[Number(id)] || '').filter(Boolean).slice(0, 3).join(', ');

const years = ['all', ...Array.from({ length: 27 }, (_, i) => (2026 - i).toString())];

// Movie Card - Uses Link for navigation
const MovieCard = memo(function MovieCard({ movie, type = 'movie' }: { 
  movie: Movie; type?: 'movie' | 'tv';
}) {
  const href = type === 'tv' ? `/tv/${movie.tmdbId || movie.id}` : `/movie/${movie.tmdbId || movie.id}`;
  
  return (
    <Link href={href}>
      <Card className="bg-[#1a1e2e] border-0 overflow-hidden hover:scale-105 transition-transform cursor-pointer group">
        <div className="relative aspect-[2/3]">
          <img src={movie.poster || '/placeholder-poster.jpg'} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute top-1 right-1 bg-black/80 rounded px-1.5 py-0.5 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs">{movie.rating?.toFixed(1) || 'N/A'}</span>
          </div>
          {type === 'tv' && movie.seasons ? (
            <div className="absolute top-1 left-1 bg-red-600 rounded px-1.5 py-0.5 text-xs font-bold">{movie.seasons} Season{movie.seasons > 1 ? 's' : ''}</div>
          ) : movie.quality && (
            <div className="absolute top-1 left-1 bg-red-600 rounded px-1.5 py-0.5 text-xs font-bold">{movie.quality}</div>
          )}
        </div>
        <CardContent className="p-2">
          <h3 className="font-medium text-sm truncate">{movie.title}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <span>{movie.year || 'N/A'}</span>
            {movie.runtime && <><span>•</span><span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span></>}
          </div>
          <p className="text-xs text-gray-500 truncate">{getGenreNames(Array.isArray(movie.genres) ? movie.genres : [])}</p>
        </CardContent>
      </Card>
    </Link>
  );
});

// Download Button Component
const DownloadButton = ({ serverName, url, color }: { serverName: string; url: string; color?: string }) => (
  <a 
    href={url} 
    target="_blank" 
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all hover:scale-105"
    style={{ backgroundColor: color || '#ef4444' }}
  >
    <Download className="w-3 h-3" />
    {serverName}
  </a>
);

export default function Home() {
  // UI States
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // View States
  const [currentView, setCurrentView] = useState<'home' | 'movies' | 'tvshows' | 'genre'>('home');
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [moviesPage, setMoviesPage] = useState(1);
  const [tvShowsPage, setTVShowsPage] = useState(1);
  const [totalMoviesPages, setTotalMoviesPages] = useState(1);
  const [totalTVShowsPages, setTotalTVShowsPages] = useState(1);
  
  // Detail Modal
  const [selectedItem, setSelectedItem] = useState<Movie | null>(null);
  const [selectedType, setSelectedType] = useState<'movie' | 'tv'>('movie');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Movie>>({});
  const [itemDbId, setItemDbId] = useState<string | null>(null);
  
  // Download Links
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([]);
  const [newDownload, setNewDownload] = useState({ serverName: '', url: '', size: '', resolution: '' });
  const [servers, setServers] = useState<Server[]>([]);
  
  // TV Series
  const [tvSeasons, setTVSeasons] = useState<TVSeason[]>([]);
  const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set());
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<string>>(new Set());
  const [episodeDownloadLinks, setEpisodeDownloadLinks] = useState<Record<string, DownloadLink[]>>({});
  
  // Data
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [movieTags, setMovieTags] = useState<Tag[]>([]);
  const [tvTags, setTvTags] = useState<Tag[]>([]);
  const [filteredItems, setFilteredItems] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<{movies: Movie[], tvShows: Movie[]}>({ movies: [], tvShows: [] });
  
  // Generator
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [tmdbGenres, setTmdbGenres] = useState<{ id: number; name: string }[]>([]);
  const [generatorSearch, setGeneratorSearch] = useState('');
  const [generatorResults, setGeneratorResults] = useState<Movie[]>([]);
  const [generatorPage, setGeneratorPage] = useState(1);
  const [generatorTotalPages, setGeneratorTotalPages] = useState(1);
  const [selectedForImport, setSelectedForImport] = useState<Set<number>>(new Set());
  const [newServerName, setNewServerName] = useState('');
  const [showAddServer, setShowAddServer] = useState(false);
  
  // Generator Filters
  const [genType, setGenType] = useState<'movie' | 'tv'>('movie');
  const [genYear, setGenYear] = useState('all');
  const [genGenre, setGenGenre] = useState('all');

  // Initialize
  useEffect(() => {
    checkAuth();
    fetchMovies();
    fetchTVShows();
    fetchGenres();
    fetchTags();
    fetchServers();
  }, []);

  useEffect(() => {
    if (currentView === 'movies') fetchMovies(moviesPage);
    if (currentView === 'tvshows') fetchTVShows(tvShowsPage);
  }, [moviesPage, tvShowsPage, currentView]);

  useEffect(() => {
    if (searchQuery.length > 0) performSearch();
    else setSearchResults({ movies: [], tvShows: [] });
  }, [searchQuery]);

  useEffect(() => {
    fetchTmdbGenres(genType);
  }, [genType]);

  // API Functions
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch { setIsAuthenticated(false); }
  };

  const fetchMovies = async (page = 1) => {
    try {
      const res = await fetch(`/api/movies?source=tmdb&page=${page}&limit=18`);
      const data = await res.json();
      setMovies(data.movies || []);
      setTotalMoviesPages(data.totalPages || 1);
    } catch { console.error('Failed to fetch movies'); }
  };

  const fetchTVShows = async (page = 1) => {
    try {
      const res = await fetch(`/api/tv-shows?source=tmdb&page=${page}&limit=18`);
      const data = await res.json();
      setTvShows(data.tvShows || []);
      setTotalTVShowsPages(data.totalPages || 1);
    } catch { console.error('Failed to fetch TV shows'); }
  };

  const fetchGenres = async () => {
    try {
      const [movieRes, tvRes] = await Promise.all([
        fetch('/api/genres?type=movie'),
        fetch('/api/genres?type=tv'),
      ]);
      const movieData = await movieRes.json();
      const tvData = await tvRes.json();
      setMovieGenres(movieData.genres || []);
      setTvGenres(tvData.genres || []);
    } catch { console.error('Failed to fetch genres'); }
  };

  const fetchTags = async () => {
    try {
      const [movieRes, tvRes] = await Promise.all([
        fetch('/api/tags?type=movie'),
        fetch('/api/tags?type=tv'),
      ]);
      const movieData = await movieRes.json();
      const tvData = await tvRes.json();
      setMovieTags(movieData.tags || []);
      setTvTags(tvData.tags || []);
    } catch { console.error('Failed to fetch tags'); }
  };

  const fetchServers = async () => {
    try {
      const res = await fetch('/api/servers');
      const data = await res.json();
      setServers(data.servers || []);
    } catch { }
  };

  const performSearch = async () => {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults({ movies: data.movies || [], tvShows: data.tvShows || [] });
    } catch { setSearchResults({ movies: [], tvShows: [] }); }
  };

  const searchTMDB = async (page = 1) => {
    if (!generatorSearch) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(generatorSearch)}&source=tmdb&type=${genType}&page=${page}`);
      const data = await res.json();
      const results = genType === 'movie' ? data.movies : data.tvShows;
      setGeneratorResults(results || []);
      setGeneratorPage(data.currentPage || page);
      setGeneratorTotalPages(data.totalPages || 1);
    } catch { setGeneratorResults([]); }
    finally { setIsGenerating(false); }
  };

  const fetchTmdbGenres = async (type: 'movie' | 'tv') => {
    try {
      const res = await fetch(`/api/tmdb/genres?type=${type}`);
      const data = await res.json();
      setTmdbGenres(data.genres || []);
    } catch { }
  };

  const fetchTVSeasons = async (tvShowId: string) => {
    try {
      const res = await fetch(`/api/tv-shows/${tvShowId}/seasons`);
      const data = await res.json();
      setTVSeasons(data.seasons || []);
    } catch { setTVSeasons([]); }
  };

  const fetchEpisodeDownloads = async (episodeId: string) => {
    try {
      const res = await fetch(`/api/downloads?episodeId=${episodeId}`);
      const data = await res.json();
      setEpisodeDownloadLinks(prev => ({ ...prev, [episodeId]: data.links || [] }));
    } catch { }
  };

  // Check if movie exists in database and get its ID
  const getDbId = async (item: Movie, type: 'movie' | 'tv'): Promise<string | null> => {
    const tmdbId = item.tmdbId || item.id;
    const endpoint = type === 'movie' ? '/api/movies' : '/api/tv-shows';
    const res = await fetch(`${endpoint}?tmdbId=${tmdbId}`);
    const data = await res.json();
    if (data.movie || data.tvShow) {
      return (data.movie || data.tvShow).id;
    }
    return null;
  };

  // Save item to database
  const saveItemToDatabase = async (item: Movie, type: 'movie' | 'tv'): Promise<string> => {
    const endpoint = type === 'movie' ? '/api/movies' : '/api/tv-shows';
    const body = {
      title: item.title,
      poster: item.poster,
      backdrop: item.backdrop,
      year: item.year,
      rating: item.rating,
      genres: item.genres,
      overview: item.overview,
      runtime: item.runtime,
      tmdbId: item.tmdbId || item.id,
      seasons: item.seasons,
    };
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    return data.id;
  };

  const openDetail = async (item: Movie, type: 'movie' | 'tv') => {
    setSelectedItem(item);
    setSelectedType(type);
    setEditForm(item);
    setIsEditing(false);
    setDetailModalOpen(true);
    setExpandedSeasons(new Set());
    setExpandedEpisodes(new Set());
    setEpisodeDownloadLinks({});
    setNewDownload({ serverName: '', url: '', size: '', resolution: '' });
    
    const tmdbId = item.tmdbId || item.id;
    
    // Try to find if item exists in database
    try {
      const endpoint = type === 'movie' ? '/api/movies' : '/api/tv-shows';
      const res = await fetch(`${endpoint}?tmdbId=${tmdbId}`);
      const data = await res.json();
      const dbItem = data.movie || data.tvShow;
      
      if (dbItem) {
        setItemDbId(dbItem.id);
        setSelectedItem({ ...item, id: dbItem.id, savedToDb: true });
        
        if (type === 'movie') {
          const linksRes = await fetch(`/api/downloads?movieId=${dbItem.id}`);
          setDownloadLinks((await linksRes.json()).links || []);
        } else {
          setDownloadLinks([]);
          await fetchTVSeasons(dbItem.id);
        }
      } else {
        setItemDbId(null);
        setDownloadLinks([]);
        if (type === 'tv') {
          setTVSeasons([]);
        }
      }
    } catch {
      setItemDbId(null);
      setDownloadLinks([]);
    }
  };

  const handleGenreClick = async (genre: Genre) => {
    setSelectedGenre(genre);
    setCurrentView('genre');
    setMenuOpen(false);
    
    try {
      const endpoint = genre.type === 'movie' ? 'movies' : 'tv-shows';
      const res = await fetch(`/api/${endpoint}?genre=${genre.tmdbId}`);
      const data = await res.json();
      setFilteredItems(data.movies || data.tvShows || []);
    } catch {
      setFilteredItems([]);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    
    setIsGenerating(true);
    try {
      let dbId = itemDbId;
      
      // If not in database, save first
      if (!dbId) {
        dbId = await saveItemToDatabase(editForm as Movie, selectedType);
        setItemDbId(dbId);
      }
      
      // Update the item
      const endpoint = selectedType === 'tv' ? `/api/tv-shows/${dbId}` : `/api/movies/${dbId}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          overview: editForm.overview,
          year: editForm.year,
          quality: editForm.quality,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setSelectedItem({ ...selectedItem, ...editForm, id: dbId, savedToDb: true });
        toast.success('Updated!');
        fetchMovies();
        fetchTVShows();
        setIsEditing(false);
      } else {
        toast.error('Failed to update');
      }
    } catch { toast.error('Failed'); }
    finally { setIsGenerating(false); }
  };

  const handleDelete = async () => {
    if (!selectedItem || !confirm('Delete this item?')) return;
    try {
      const endpoint = selectedType === 'tv' ? `/api/tv-shows/${selectedItem.id}` : `/api/movies/${selectedItem.id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deleted!');
        setDetailModalOpen(false);
        fetchMovies();
        fetchTVShows();
      }
    } catch { toast.error('Failed'); }
  };

  const addDownloadLink = async (episodeId?: string) => {
    if (!newDownload.serverName || !newDownload.url) {
      toast.error('Server Name and URL required');
      return;
    }
    
    if (!selectedItem) {
      toast.error('No item selected');
      return;
    }

    setIsGenerating(true);
    
    try {
      let dbId = itemDbId;
      
      // If not in database, save first
      if (!dbId) {
        dbId = await saveItemToDatabase(selectedItem, selectedType);
        setItemDbId(dbId);
        setSelectedItem({ ...selectedItem, id: dbId, savedToDb: true });
      }
      
      const body: Record<string, unknown> = { 
        serverName: newDownload.serverName, 
        url: newDownload.url, 
        size: newDownload.size, 
        resolution: newDownload.resolution 
      };
      
      if (selectedType === 'movie') {
        body.movieId = dbId;
      } else if (episodeId) {
        body.episodeId = episodeId;
      } else {
        toast.error('Please expand an episode first');
        setIsGenerating(false);
        return;
      }
      
      const res = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (res.ok) {
        toast.success('Download link added!');
        setNewDownload({ serverName: '', url: '', size: '', resolution: '' });
        
        if (selectedType === 'movie') {
          const linksRes = await fetch(`/api/downloads?movieId=${dbId}`);
          setDownloadLinks((await linksRes.json()).links || []);
        } else if (episodeId) {
          await fetchEpisodeDownloads(episodeId);
        }
        
        fetchMovies();
        fetchTVShows();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to add link');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to add download link');
    }
    finally { 
      setIsGenerating(false); 
    }
  };

  const deleteDownloadLink = async (id: string, episodeId?: string) => {
    try {
      await fetch(`/api/downloads?id=${id}`, { method: 'DELETE' });
      
      if (episodeId) {
        setEpisodeDownloadLinks(prev => ({
          ...prev,
          [episodeId]: (prev[episodeId] || []).filter(l => l.id !== id)
        }));
      } else {
        setDownloadLinks(downloadLinks.filter(l => l.id !== id));
      }
      toast.success('Deleted!');
    } catch { toast.error('Failed'); }
  };

  const addServer = async () => {
    if (!newServerName.trim()) return;
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newServerName }),
      });
      if (res.ok) {
        fetchServers();
        setNewServerName('');
        setShowAddServer(false);
        toast.success('Server added!');
      }
    } catch { toast.error('Failed'); }
  };

  const toggleSeason = (seasonId: string) => {
    const newSet = new Set(expandedSeasons);
    if (newSet.has(seasonId)) newSet.delete(seasonId);
    else newSet.add(seasonId);
    setExpandedSeasons(newSet);
  };

  const toggleEpisode = async (episodeId: string) => {
    const newSet = new Set(expandedEpisodes);
    if (newSet.has(episodeId)) {
      newSet.delete(episodeId);
    } else {
      newSet.add(episodeId);
      if (!episodeDownloadLinks[episodeId]) {
        await fetchEpisodeDownloads(episodeId);
      }
    }
    setExpandedEpisodes(newSet);
  };

  const toggleSelectForImport = (tmdbId: number) => {
    const newSet = new Set(selectedForImport);
    if (newSet.has(tmdbId)) newSet.delete(tmdbId);
    else newSet.add(tmdbId);
    setSelectedForImport(newSet);
  };

  const importSelected = async () => {
    if (selectedForImport.size === 0) {
      toast.error('Select items first');
      return;
    }
    setIsGenerating(true);
    try {
      const items = generatorResults.filter(r => selectedForImport.has(Number(r.tmdbId || r.id)));
      const endpoint = genType === 'movie' ? '/api/movies' : '/api/tv-shows';
      
      for (const item of items) {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: item.title,
            poster: item.poster,
            backdrop: item.backdrop,
            year: item.year,
            rating: item.rating,
            genres: item.genres,
            overview: item.overview,
            runtime: item.runtime,
            tmdbId: item.tmdbId || item.id,
            seasons: item.seasons,
          }),
        });
      }
      toast.success(`Imported ${items.length} items!`);
      setSelectedForImport(new Set());
      fetchMovies();
      fetchTVShows();
    } catch { toast.error('Failed'); }
    finally { setIsGenerating(false); }
  };

  const clearAllPosts = async () => {
    if (!confirm('DELETE ALL MOVIES AND TV SHOWS?\nThis cannot be undone!')) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/clear', { method: 'POST' });
      if (res.ok) {
        toast.success('All posts cleared!');
        setMovies([]);
        setTvShows([]);
        fetchMovies();
        fetchTVShows();
      }
    } catch { toast.error('Failed'); }
    finally { setIsGenerating(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setAdminModalOpen(false);
        toast.success('Login successful!');
        setLoginForm({ username: '', password: '' });
      } else toast.error('Login failed');
    } catch { toast.error('Failed'); }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    toast.success('Logged out');
  };

  const handleSetup = async () => {
    try {
      await fetch('/api/admin/setup', { method: 'POST' });
      toast.success('Admin account created! You can now login.');
    } catch { toast.error('Failed'); }
  };

  // Render download links table
  const renderDownloadTable = (links: DownloadLink[], episodeId?: string) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#1a1e2e]">
            <th className="p-2 border border-red-900/30 text-center w-12">No</th>
            <th className="p-2 border border-red-900/30">Server</th>
            <th className="p-2 border border-red-900/30">Size</th>
            <th className="p-2 border border-red-900/30">Resolution</th>
            {isAuthenticated && <th className="p-2 border border-red-900/30 w-16">Action</th>}
          </tr>
        </thead>
        <tbody>
          {links.length > 0 ? links.map((link, i) => (
            <tr key={link.id} className="hover:bg-[#1a1e2e]/50">
              <td className="p-2 border border-red-900/30 text-center">{i + 1}</td>
              <td className="p-2 border border-red-900/30">
                <DownloadButton 
                  serverName={link.serverName} 
                  url={link.url} 
                  color={servers.find(s => s.name === link.serverName)?.color || '#ef4444'}
                />
              </td>
              <td className="p-2 border border-red-900/30">{link.size || '-'}</td>
              <td className="p-2 border border-red-900/30">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${resolutionColors[link.resolution] || 'bg-red-600'}`}>
                  {link.resolution || '-'}
                </span>
              </td>
              {isAuthenticated && (
                <td className="p-2 border border-red-900/30 text-center">
                  <Button size="sm" variant="ghost" onClick={() => deleteDownloadLink(link.id, episodeId)} className="h-7 text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              )}
            </tr>
          )) : (
            <tr><td colSpan={isAuthenticated ? 5 : 4} className="p-4 text-center text-gray-400">No download links</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Render add download form
  const renderAddDownloadForm = (episodeId?: string) => (
    <div className="mt-3 p-3 bg-[#1a1e2e]/50 rounded-lg border border-red-900/20">
      <h5 className="font-medium mb-2 text-sm text-red-400">Add Download Link</h5>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div>
          <Label className="text-xs mb-1 block">Server Name</Label>
          <div className="flex gap-1">
            <Select value={newDownload.serverName} onValueChange={(v) => setNewDownload({...newDownload, serverName: v})}>
              <SelectTrigger className="bg-[#12151c] h-9 text-xs flex-1"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="bg-[#12151c]">
                {servers.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => setShowAddServer(!showAddServer)} className="h-9 px-2 shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {showAddServer && (
            <div className="mt-2 flex gap-1">
              <Input value={newServerName} onChange={(e) => setNewServerName(e.target.value)} placeholder="Server name" className="bg-[#12151c] h-8 text-xs flex-1" />
              <Button size="sm" onClick={addServer} className="h-8 bg-red-600 text-xs shrink-0">Add</Button>
            </div>
          )}
        </div>
        <div>
          <Label className="text-xs mb-1 block">URL</Label>
          <Input value={newDownload.url} onChange={(e) => setNewDownload({...newDownload, url: e.target.value})} placeholder="https://..." className="bg-[#12151c] h-9 text-xs" />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Size</Label>
          <Input value={newDownload.size} onChange={(e) => setNewDownload({...newDownload, size: e.target.value})} placeholder="1.5GB" className="bg-[#12151c] h-9 text-xs" />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Resolution</Label>
          <Select value={newDownload.resolution} onValueChange={(v) => setNewDownload({...newDownload, resolution: v})}>
            <SelectTrigger className="bg-[#12151c] h-9 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent className="bg-[#12151c]">
              <SelectItem value="4K">4K</SelectItem>
              <SelectItem value="1080p">1080p</SelectItem>
              <SelectItem value="720p">720p</SelectItem>
              <SelectItem value="480p">480p</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button 
            onClick={() => addDownloadLink(episodeId)} 
            disabled={isGenerating}
            className="w-full bg-red-600 hover:bg-red-700 h-9 text-xs"
          >
            {isGenerating ? 'Adding...' : 'Add Link'}
          </Button>
        </div>
      </div>
    </div>
  );

  // Render Content
  const renderContent = () => {
    if (searchQuery && (searchResults.movies.length > 0 || searchResults.tvShows.length > 0)) {
      return (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-400">Search: &quot;{searchQuery}&quot;</h2>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')} className="border-red-600">Clear</Button>
          </div>
          {searchResults.movies.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-3">Movies</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                {searchResults.movies.map((m) => <MovieCard key={m.id} movie={m} type="movie" />)}
              </div>
            </>
          )}
          {searchResults.tvShows.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-3">TV Series</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {searchResults.tvShows.map((s) => <MovieCard key={s.id} movie={s} type="tv" />)}
              </div>
            </>
          )}
        </section>
      );
    }

    if (currentView === 'movies') {
      return (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-400"><Film className="inline mr-2" />Movies</h2>
            <Button variant="outline" size="sm" onClick={() => setCurrentView('home')} className="border-red-600"><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {movies.map((m) => <MovieCard key={m.id} movie={m} type="movie" />)}
          </div>
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" disabled={moviesPage === 1} onClick={() => setMoviesPage(p => p - 1)}><ChevronLeft /></Button>
            <span className="text-sm">{moviesPage}/{totalMoviesPages}</span>
            <Button variant="outline" size="sm" disabled={moviesPage >= totalMoviesPages} onClick={() => setMoviesPage(p => p + 1)}><ChevronRight /></Button>
          </div>
        </section>
      );
    }

    if (currentView === 'tvshows') {
      return (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-400"><Tv className="inline mr-2" />TV Series</h2>
            <Button variant="outline" size="sm" onClick={() => setCurrentView('home')} className="border-red-600"><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {tvShows.map((s) => <MovieCard key={s.id} movie={s} type="tv" />)}
          </div>
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" disabled={tvShowsPage === 1} onClick={() => setTVShowsPage(p => p - 1)}><ChevronLeft /></Button>
            <span className="text-sm">{tvShowsPage}/{totalTVShowsPages}</span>
            <Button variant="outline" size="sm" disabled={tvShowsPage >= totalTVShowsPages} onClick={() => setTVShowsPage(p => p + 1)}><ChevronRight /></Button>
          </div>
        </section>
      );
    }

    if (currentView === 'genre' && selectedGenre) {
      return (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: selectedGenre.color }}>{selectedGenre.name} ({selectedGenre.count || 0})</h2>
            <Button variant="outline" size="sm" onClick={() => { setCurrentView('home'); setSelectedGenre(null); }} className="border-red-600"><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredItems.map((item) => <MovieCard key={item.id} movie={item} type={selectedGenre.type as 'movie' | 'tv'} />)}
          </div>
        </section>
      );
    }

    return (
      <>
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-400"><Film className="inline mr-2" />Movies</h2>
            <Link href="/movies">
              <Button size="sm" className="bg-red-600 hover:bg-red-700">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {movies.slice(0, 12).map((m) => <MovieCard key={m.id} movie={m} type="movie" />)}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-400"><Tv className="inline mr-2" />TV Series</h2>
            <Link href="/tv-series">
              <Button size="sm" className="bg-red-600 hover:bg-red-700">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {tvShows.slice(0, 12).map((s) => <MovieCard key={s.id} movie={s} type="tv" />)}
          </div>
        </section>

        <section className="mb-8">
          <Tabs defaultValue="movies">
            <h2 className="text-xl font-bold mb-4 text-red-400">Genres</h2>
            <TabsList className="bg-[#1a1e2e] mb-4">
              <TabsTrigger value="movies" className="data-[state=active]:bg-red-600">Movies</TabsTrigger>
              <TabsTrigger value="tv" className="data-[state=active]:bg-red-600">TV Shows</TabsTrigger>
            </TabsList>
            <TabsContent value="movies">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {movieGenres.map((g) => (
                  <div key={g.id} onClick={() => handleGenreClick(g)} className="flex items-center justify-between p-3 bg-[#1a1e2e] rounded-lg hover:bg-[#252a3d] cursor-pointer border-l-4" style={{ borderLeftColor: g.color }}>
                    <span>{g.name}</span>
                    <span className="text-gray-400 text-sm">{g.count || 0}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="tv">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {tvGenres.map((g) => (
                  <div key={g.id} onClick={() => handleGenreClick(g)} className="flex items-center justify-between p-3 bg-[#1a1e2e] rounded-lg hover:bg-[#252a3d] cursor-pointer border-l-4" style={{ borderLeftColor: g.color }}>
                    <span>{g.name}</span>
                    <span className="text-gray-400 text-sm">{g.count || 0}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white">
      <Toaster />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#12151c]/95 backdrop-blur-sm border-b border-red-900/30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-red-500 cursor-pointer">HomieTV</Link>
          
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search movies & TV shows..." className="bg-[#1a1e2e] border-red-900/30 pl-10" />
            </div>
          </div>
          
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-red-900/20 rounded-lg">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#12151c] border-b border-red-900/30 py-4 px-4 shadow-xl z-50">
            <nav className="container mx-auto flex flex-col gap-2">
              <Link href="/" onClick={() => setMenuOpen(false)} className="p-3 hover:bg-red-900/20 rounded-lg cursor-pointer">Home</Link>
              <Link href="/movies" onClick={() => setMenuOpen(false)} className="p-3 hover:bg-red-900/20 rounded-lg cursor-pointer">Movies</Link>
              <Link href="/tv-series" onClick={() => setMenuOpen(false)} className="p-3 hover:bg-red-900/20 rounded-lg cursor-pointer">TV Series</Link>
              <div className="border-t border-red-900/30 my-2" />
              {isAuthenticated ? (
                <>
                  <button onClick={() => { setGeneratorModalOpen(true); setMenuOpen(false); }} className="p-3 hover:bg-red-900/20 rounded-lg text-left"><Settings className="inline mr-2" />Generator</button>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="p-3 hover:bg-red-900/20 rounded-lg text-left text-red-400"><LogOut className="inline mr-2" />Logout</button>
                </>
              ) : (
                <>
                  <button onClick={handleSetup} className="p-3 hover:bg-red-900/20 rounded-lg text-left text-green-400"><Settings className="inline mr-2" />Setup Admin</button>
                  <button onClick={() => { setAdminModalOpen(true); setMenuOpen(false); }} className="p-3 hover:bg-red-900/20 rounded-lg text-left"><LogIn className="inline mr-2" />Admin Login</button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-6">{renderContent()}</main>

      <footer className="bg-[#0a0c10] border-t border-red-900/30 py-6 text-center">
        <h3 className="text-xl font-bold text-red-500 mb-2">HomieTV</h3>
        <p className="text-sm text-gray-400">Copyright © 2025 HomieTV. All Rights Reserved.</p>
      </footer>


      {/* Login Modal */}
      <Dialog open={adminModalOpen} onOpenChange={setAdminModalOpen}>
        <DialogContent className="bg-[#12151c] border-red-900/30">
          <DialogHeader><DialogTitle>Admin Login</DialogTitle></DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><Label>Username</Label><Input value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} className="bg-[#1a1e2e]" /></div>
            <div><Label>Password</Label><Input type="password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} className="bg-[#1a1e2e]" /></div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Login</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generator Modal */}
      <Dialog open={generatorModalOpen} onOpenChange={setGeneratorModalOpen}>
        <DialogContent className="bg-[#12151c] border-red-900/30 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Settings className="text-red-400" />TMDB Generator</span>
              {isAuthenticated && (
                <Button variant="destructive" size="sm" onClick={clearAllPosts} disabled={isGenerating}>
                  <Trash className="w-4 h-4 mr-1" />Clear All
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-[#1a1e2e] rounded-lg">
              <div>
                <Label className="text-xs mb-1 block">Type</Label>
                <Select value={genType} onValueChange={(v) => setGenType(v as 'movie' | 'tv')}>
                  <SelectTrigger className="bg-[#12151c] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#12151c]">
                    <SelectItem value="movie">Movies</SelectItem>
                    <SelectItem value="tv">TV Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Year</Label>
                <Select value={genYear} onValueChange={setGenYear}>
                  <SelectTrigger className="bg-[#12151c] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#12151c] max-h-48">
                    {years.map((y) => <SelectItem key={y} value={y}>{y === 'all' ? 'All Years' : y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Genre</Label>
                <Select value={genGenre} onValueChange={setGenGenre}>
                  <SelectTrigger className="bg-[#12151c] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#12151c] max-h-48">
                    <SelectItem value="all">All Genres</SelectItem>
                    {tmdbGenres.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 bg-[#1a1e2e] rounded-lg">
              <div className="flex gap-2 mb-3">
                <Input 
                  value={generatorSearch} 
                  onChange={(e) => setGeneratorSearch(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && searchTMDB(1)}
                  placeholder="Search movies or TV shows..." 
                  className="bg-[#12151c] flex-1" 
                />
                <Button onClick={() => searchTMDB(1)} className="bg-red-600" disabled={isGenerating}>
                  <Search className="w-4 h-4 mr-1" />Search
                </Button>
              </div>
              
              {/* Results */}
              {generatorResults.length > 0 && (
                <>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-80 overflow-y-auto mb-3 p-2 bg-[#12151c] rounded">
                    {generatorResults.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => toggleSelectForImport(Number(item.tmdbId || item.id))}
                        className={`relative cursor-pointer rounded overflow-hidden border-2 transition-all ${selectedForImport.has(Number(item.tmdbId || item.id)) ? 'border-green-500 ring-2 ring-green-500/30' : 'border-transparent hover:border-red-500'}`}
                      >
                        <img src={item.poster || '/placeholder.jpg'} alt={item.title} className="w-full aspect-[2/3] object-cover" />
                        {selectedForImport.has(Number(item.tmdbId || item.id)) && (
                          <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1"><Check className="w-3 h-3" /></div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-xs truncate">{item.title}</div>
                        <div className="absolute top-1 left-1 bg-black/60 rounded px-1 text-xs">{item.year}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={generatorPage === 1} onClick={() => searchTMDB(generatorPage - 1)}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">{generatorPage} / {generatorTotalPages}</span>
                      <Button variant="outline" size="sm" disabled={generatorPage >= generatorTotalPages} onClick={() => searchTMDB(generatorPage + 1)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-gray-400">{selectedForImport.size} selected</span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button onClick={importSelected} disabled={isGenerating || selectedForImport.size === 0} className="bg-green-600 hover:bg-green-700 flex-1">
                      {isGenerating ? 'Importing...' : `Import Selected (${selectedForImport.size})`}
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedForImport(new Set())} disabled={selectedForImport.size === 0}>
                      <XCircle className="w-4 h-4 mr-1" />Clear Selection
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
