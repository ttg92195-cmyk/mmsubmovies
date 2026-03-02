'use client';

import { useState, useEffect, memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Film, ChevronLeft, ChevronRight, Menu, X, Search, Settings, LogIn, LogOut, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

interface Movie {
  id: string | number;
  title: string;
  poster: string | null;
  year: number | null;
  rating: number;
  genres: number[] | string[];
  runtime?: number;
  quality?: string;
  tmdbId?: number;
  savedToDb?: boolean;
}

const genreNames: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

const getGenreNames = (genreIds: number[] | string[]): string => 
  genreIds.map(id => genreNames[Number(id)] || '').filter(Boolean).slice(0, 3).join(', ');

const MovieCard = memo(function MovieCard({ movie }: { movie: Movie }) {
  const href = `/movie/${movie.tmdbId || movie.id}`;
  
  return (
    <Link href={href}>
      <Card className="bg-[#1a1e2e] border-0 overflow-hidden hover:scale-105 transition-transform cursor-pointer">
        <div className="relative aspect-[2/3]">
          <img src={movie.poster || '/placeholder-poster.jpg'} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute top-1 right-1 bg-black/80 rounded px-1.5 py-0.5 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs">{movie.rating?.toFixed(1) || 'N/A'}</span>
          </div>
          {movie.quality && (
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

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/movies?source=tmdb&page=${page}&limit=18`, { cache: 'no-store' });
      const data = await res.json();
      setMovies(data.movies || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      console.error('Failed to fetch movies');
    }
    setIsLoading(false);
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchMovies();
      await checkAuth();
    })();
  }, [page]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    toast.success('Logged out');
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white">
      <Toaster />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#12151c]/95 backdrop-blur-sm border-b border-red-900/30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-red-500">HomieTV</Link>
          
          <div className="flex-1 max-w-md mx-4">
            <Link href="/">
              <Input placeholder="Search movies & TV shows..." className="bg-[#1a1e2e] border-red-900/30 pl-4" readOnly />
            </Link>
          </div>
          
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-red-900/20 rounded-lg">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#12151c] border-b border-red-900/30 py-4 px-4 shadow-xl z-50">
            <nav className="container mx-auto flex flex-col gap-2">
              <Link href="/" className="p-3 hover:bg-red-900/20 rounded-lg">Home</Link>
              <Link href="/movies" className="p-3 hover:bg-red-900/20 rounded-lg text-red-400">Movies</Link>
              <Link href="/tv-series" className="p-3 hover:bg-red-900/20 rounded-lg">TV Series</Link>
              <div className="border-t border-red-900/30 my-2" />
              {isAuthenticated ? (
                <>
                  <button onClick={() => router.push('/?generator=true')} className="p-3 hover:bg-red-900/20 rounded-lg text-left"><Settings className="inline mr-2" />Generator</button>
                  <button onClick={handleLogout} className="p-3 hover:bg-red-900/20 rounded-lg text-left text-red-400"><LogOut className="inline mr-2" />Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => router.push('/?setup=true')} className="p-3 hover:bg-red-900/20 rounded-lg text-left text-green-400"><Settings className="inline mr-2" />Setup Admin</button>
                  <button onClick={() => router.push('/?login=true')} className="p-3 hover:bg-red-900/20 rounded-lg text-left"><LogIn className="inline mr-2" />Admin Login</button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-red-400 flex items-center gap-2">
            <Film className="w-6 h-6" /> Movies
          </h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border-red-600">
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="border-red-600">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </main>

      <footer className="bg-[#0a0c10] border-t border-red-900/30 py-6 text-center mt-8">
        <h3 className="text-xl font-bold text-red-500 mb-2">HomieTV</h3>
        <p className="text-sm text-gray-400">Copyright © 2025 HomieTV. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
