'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAppStore, Movie } from '@/store'
import { 
  Film, Search, Menu, X, Download, 
  Bookmark, Settings, User, LogOut, ChevronRight, 
  Eye, EyeOff, Loader2, RefreshCw, Home, Tv, Grid
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { MovieCard } from '@/components/movie/MovieCard'
import { SeriesCard } from '@/components/movie/SeriesCard'
import { BottomNav } from '@/components/movie/BottomNav'
import { HeroBanner } from '@/components/movie/HeroBanner'

// Sample fallback data for Vercel deployment (no SQLite)
const SAMPLE_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    rating: 9.0,
    year: 2008,
    duration: 152,
    genre: 'Action, Crime, Drama',
    language: 'en',
    isSeries: false,
    isFeatured: false,
    isTrending: true,
    isIconic: true,
    cast: [
      { id: 'c1', name: 'Christian Bale', character: 'Bruce Wayne / Batman', profileUrl: 'https://image.tmdb.org/t/p/w185/qCpZn2e3dimwbryLnqxZuI88PTi.jpg' },
      { id: 'c2', name: 'Heath Ledger', character: 'Joker', profileUrl: 'https://image.tmdb.org/t/p/w185/5Y9HnYYa9jF4NunY9lSgJGjSe8E.jpg' },
    ],
    downloadLinks: [
      { id: 'd1', quality: '720p', url: '#', source: 'Server-1' },
      { id: 'd2', quality: '1080p', url: '#', source: 'Server-1' },
    ]
  },
  {
    id: '2',
    title: 'Inception',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep9B1QDKYHz.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    rating: 8.8,
    year: 2010,
    duration: 148,
    genre: 'Action, Science Fiction, Adventure',
    language: 'en',
    isSeries: false,
    isFeatured: false,
    isTrending: true,
    isIconic: true,
    cast: [
      { id: 'c3', name: 'Leonardo DiCaprio', character: 'Dom Cobb', profileUrl: 'https://image.tmdb.org/t/p/w185/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg' },
      { id: 'c4', name: 'Joseph Gordon-Levitt', character: 'Arthur', profileUrl: 'https://image.tmdb.org/t/p/w185/zvpTRs6TKLwctQRc4Xkvo6OmGVz.jpg' },
    ],
    downloadLinks: [
      { id: 'd3', quality: '720p', url: '#', source: 'Server-1' },
      { id: 'd4', quality: '1080p', url: '#', source: 'Server-1' },
    ]
  },
  {
    id: '3',
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    rating: 8.7,
    year: 2014,
    duration: 169,
    genre: 'Adventure, Drama, Science Fiction',
    language: 'en',
    isSeries: false,
    isFeatured: false,
    isTrending: false,
    isIconic: true,
    cast: [
      { id: 'c5', name: 'Matthew McConaughey', character: 'Cooper', profileUrl: 'https://image.tmdb.org/t/p/w185/wJiGedOCZhwMx9DezY8uwbNxmAY.jpg' },
      { id: 'c6', name: 'Anne Hathaway', character: 'Brand', profileUrl: 'https://image.tmdb.org/t/p/w185/tLelKoPNiyJCSEtQTz1FGv4TLGc.jpg' },
    ],
    downloadLinks: [
      { id: 'd5', quality: '720p', url: '#', source: 'Server-1' },
      { id: 'd6', quality: '1080p', url: '#', source: 'Server-1' },
    ]
  },
  {
    id: '4',
    title: 'Breaking Bad',
    overview: 'When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    rating: 9.0,
    year: 2008,
    duration: 47,
    genre: 'Drama, Crime',
    language: 'en',
    isSeries: true,
    isFeatured: false,
    isTrending: true,
    isIconic: true,
    cast: [],
    downloadLinks: [],
    series: {
      id: 's1',
      status: 'Ended',
      seasons: [
        { id: 'ss1', seasonNumber: 1, episodes: Array.from({ length: 7 }, (_, i) => ({ id: `ep1${i}`, episodeNumber: i + 1, title: `Episode ${i + 1}`, downloadLinks: [] })) },
        { id: 'ss2', seasonNumber: 2, episodes: Array.from({ length: 13 }, (_, i) => ({ id: `ep2${i}`, episodeNumber: i + 1, title: `Episode ${i + 1}`, downloadLinks: [] })) },
      ]
    }
  },
  {
    id: '5',
    title: 'Game of Thrones',
    overview: 'Seven noble families fight for control of the mythical land of Westeros.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
    rating: 8.5,
    year: 2011,
    duration: 60,
    genre: 'Drama, Fantasy, Action',
    language: 'en',
    isSeries: true,
    isFeatured: false,
    isTrending: true,
    isIconic: false,
    cast: [],
    downloadLinks: [],
    series: {
      id: 's2',
      status: 'Ended',
      seasons: [
        { id: 'ss3', seasonNumber: 1, episodes: Array.from({ length: 10 }, (_, i) => ({ id: `ep3${i}`, episodeNumber: i + 1, title: `Episode ${i + 1}`, downloadLinks: [] })) },
        { id: 'ss4', seasonNumber: 2, episodes: Array.from({ length: 10 }, (_, i) => ({ id: `ep4${i}`, episodeNumber: i + 1, title: `Episode ${i + 1}`, downloadLinks: [] })) },
      ]
    }
  },
  {
    id: '6',
    title: 'Stranger Things',
    overview: 'When a young boy vanishes, a small town uncovers a mystery.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    rating: 8.6,
    year: 2016,
    duration: 50,
    genre: 'Drama, Mystery, Sci-Fi & Fantasy',
    language: 'en',
    isSeries: true,
    isFeatured: false,
    isTrending: true,
    isIconic: false,
    cast: [],
    downloadLinks: [],
    series: {
      id: 's3',
      status: 'Returning Series',
      seasons: [
        { id: 'ss5', seasonNumber: 1, episodes: Array.from({ length: 8 }, (_, i) => ({ id: `ep5${i}`, episodeNumber: i + 1, title: `Episode ${i + 1}`, downloadLinks: [] })) },
        { id: 'ss6', seasonNumber: 2, episodes: Array.from({ length: 9 }, (_, i) => ({ id: `ep6${i}`, episodeNumber: i + 1, title: `Episode ${i + 1}`, downloadLinks: [] })) },
      ]
    }
  },
  {
    id: '7',
    title: 'Avatar',
    overview: 'In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosbbVrny.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    rating: 7.6,
    year: 2009,
    duration: 162,
    genre: 'Action, Adventure, Fantasy',
    language: 'en',
    isSeries: false,
    isFeatured: false,
    isTrending: true,
    isIconic: false,
    cast: [],
    downloadLinks: [
      { id: 'd7', quality: '720p', url: '#', source: 'Server-1' },
      { id: 'd8', quality: '1080p', url: '#', source: 'Server-1' },
    ]
  },
  {
    id: '8',
    title: 'The Prestige',
    overview: 'A mysterious story of two magicians whose intense rivalry leads them on a life-long battle for supremacy.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/c4z4tBaXfXpTLK0LK6j9A5GX4L.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/9lgyhfNB6jH1Yn8bz6DgE5e5MqG.jpg',
    rating: 8.5,
    year: 2006,
    duration: 130,
    genre: 'Drama, Mystery, Thriller',
    language: 'en',
    isSeries: false,
    isFeatured: false,
    isTrending: false,
    isIconic: true,
    cast: [],
    downloadLinks: [
      { id: 'd9', quality: '720p', url: '#', source: 'Server-1' },
      { id: 'd10', quality: '1080p', url: '#', source: 'Server-1' },
    ]
  },
]

// Sidebar Menu Component
function SidebarMenu({ 
  open, 
  onOpenChange, 
  onLoginClick,
  onSettingsClick
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginClick: () => void
  onSettingsClick: () => void
}) {
  const { user, logout, allDownloadEnabled } = useAppStore()

  const handleLogout = () => {
    logout()
    onOpenChange(false)
  }

  // Menu items with Link navigation
  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Film, label: 'Movies', href: '/movies' },
    { icon: Tv, label: 'Series', href: '/series' },
    { icon: Bookmark, label: 'Bookmark', href: '/bookmark' },
    { icon: Download, label: 'Download', href: '/download', badge: allDownloadEnabled ? 'ON' : 'OFF' },
    { icon: Grid, label: 'Genres', href: '/genres' },
    { icon: Settings, label: 'Settings', action: () => { onOpenChange(false); onSettingsClick() } },
  ]

  // TMDB Generator link for admin
  const tmdbMenuItem = user?.isAdmin ? (
    <Link
      href="/tmdb"
      onClick={() => onOpenChange(false)}
      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-3">
        <RefreshCw className="w-5 h-5 text-gray-400" />
        <span className="text-white">TMDB Generator</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-500" />
    </Link>
  ) : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 bg-[#1E1E1E] border-r border-white/10">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold"
              style={{ backgroundColor: useAppStore.getState().primaryColor }}
            >
              {user ? user.username.charAt(0).toUpperCase() : 'G'}
            </div>
            <div>
              <p className="text-lg">{user?.username || 'Guest'}</p>
              <p className="text-xs text-muted-foreground">
                {user?.isAdmin ? 'Admin' : user?.isPremium ? 'Premium' : 'Not Premium Member'}
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          <div className="space-y-1">
            {menuItems.map((item, i) => {
              const Icon = item.icon
              
              // Settings has custom action, others use Link
              if (item.action) {
                return (
                  <button
                    key={i}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className="text-white">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                )
              }
              
              return (
                <Link
                  key={i}
                  href={item.href!}
                  onClick={() => onOpenChange(false)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className="text-white">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge variant={item.badge === 'ON' ? 'default' : 'secondary'} className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                </Link>
              )
            })}
            
            {/* TMDB Generator Link for Admin */}
            {tmdbMenuItem}
            
            <div className="pt-4 border-t border-white/10 mt-4">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => { onOpenChange(false); onLoginClick() }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-white"
                >
                  <User className="w-5 h-5" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

// Horizontal scroll section component
function HorizontalSection({ 
  title, 
  items, 
  seeAllHref,
  type = 'movie'
}: { 
  title: string
  items: Movie[]
  seeAllHref?: string
  type?: 'movie' | 'series'
}) {
  const primaryColor = useAppStore((state) => state.primaryColor)
  
  return (
    <div className="mt-5">
      <div className="flex justify-between items-center mb-2 px-3">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {seeAllHref && (
          <Link 
            href={seeAllHref}
            className="text-[10px] px-2 py-0.5 rounded"
            style={{ 
              color: primaryColor,
              backgroundColor: `${primaryColor}20`
            }}
          >
            View All
          </Link>
        )}
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-3 pb-1" style={{ width: 'max-content' }}>
          {items.slice(0, 15).map(item => (
            <div key={item.id} className="w-[calc(33.33vw-12px)] flex-shrink-0">
              {type === 'series' ? (
                <SeriesCard series={item} showGenre />
              ) : (
                <MovieCard movie={item} showGenre />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pageParam = searchParams.get('page')
  
  const { 
    currentPage, setCurrentPage,
    sidebarOpen, setSidebarOpen,
    user, login, logout,
    primaryColor, setPrimaryColor,
    headerText, setHeaderText,
    allDownloadEnabled, setAllDownloadEnabled
  } = useAppStore()

  // State
  const [movies, setMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [showLogin, setShowLogin] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  
  // Sync currentPage with URL param
  useEffect(() => {
    if (pageParam === 'search') {
      setCurrentPage('search')
    } else if (currentPage === 'search' && pageParam !== 'search') {
      // If we're on search page but URL doesn't have ?page=search, go home
      setCurrentPage('home')
    }
  }, [pageParam, setCurrentPage, currentPage])

  // Settings State
  const [showSettings, setShowSettings] = useState(false)
  const [settingsColor, setSettingsColor] = useState(primaryColor)
  const [settingsHeaderText, setSettingsHeaderText] = useState(headerText)

  // Derived state
  const trendingMovies = useMemo(() => movies.filter((m: Movie) => m.isTrending && !m.isSeries), [movies])
  const trendingSeries = useMemo(() => movies.filter((m: Movie) => m.isTrending && m.isSeries), [movies])
  const moviesOnly = useMemo(() => movies.filter((m: Movie) => !m.isSeries), [movies])
  const seriesOnly = useMemo(() => movies.filter((m: Movie) => m.isSeries), [movies])
  const allGenres = useMemo(() => [...new Set(movies.flatMap((m: Movie) => m.genre.split(', ')))].filter(Boolean), [movies])

  // Fetch data
  const fetchMovies = useCallback(async () => {
    try {
      const res = await fetch('/api/movies', { cache: 'no-store' })
      const data = await res.json()
      if (data.success && data.data && data.data.length > 0) {
        setMovies(data.data)
      } else {
        setMovies(SAMPLE_MOVIES)
      }
    } catch (error) {
      console.error('Failed to fetch movies:', error)
      setMovies(SAMPLE_MOVIES)
    }
  }, [])

  // Seed database
  const seedDatabase = useCallback(async () => {
    if (isSeeding) return
    setIsSeeding(true)
    try {
      await fetch('/api/seed')
      await fetchMovies()
    } catch (error) {
      console.error('Failed to seed:', error)
    } finally {
      setIsSeeding(false)
    }
  }, [fetchMovies, isSeeding])

  // Initial load
  useEffect(() => {
    fetchMovies()
  }, [fetchMovies])

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      fetchMovies()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchMovies])

  // Seed if empty after load
  useEffect(() => {
    if (movies.length === 0 && !isSeeding) {
      const timer = setTimeout(() => {
        seedDatabase()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [movies.length, seedDatabase, isSeeding])

  // Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        const results = movies.filter((m: Movie) => 
          m.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [searchQuery, movies])

  // Handle login
  const handleLogin = useCallback(async () => {
    if (!loginUsername.trim() || !loginPassword.trim()) {
      toast.error('Please enter username and password')
      return
    }
    
    setIsLoggingIn(true)
    try {
      const success = await login(loginUsername, loginPassword)
      if (success) {
        setShowLogin(false)
        setLoginUsername('')
        setLoginPassword('')
        toast.success('Logged in successfully!')
      } else {
        toast.error('Invalid credentials')
      }
    } catch (error) {
      toast.error('Login failed')
    } finally {
      setIsLoggingIn(false)
    }
  }, [login, loginUsername, loginPassword])

  // Save settings
  const saveSettings = useCallback(async () => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryColor: settingsColor,
          headerText: settingsHeaderText,
        }),
      })
      setPrimaryColor(settingsColor)
      setHeaderText(settingsHeaderText)
      setShowSettings(false)
      toast.success('Settings saved!')
    } catch (error) {
      console.error('Save settings error:', error)
      toast.error('Failed to save settings')
    }
  }, [settingsColor, settingsHeaderText, setPrimaryColor, setHeaderText])

  // Handle search click - navigate to search URL
  const handleSearchClick = () => {
    router.push('/?page=search')
  }

  // Handle close search - navigate back to home
  const handleCloseSearch = () => {
    router.push('/')
  }

  // Render page content
  const renderPageContent = () => {
    // Search page
    if (currentPage === 'search') {
      return (
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={handleCloseSearch} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white">Search</h1>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search something..."
              className="pl-10 bg-secondary border-white/10"
            />
          </div>

          {searchQuery && searchResults.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {searchResults.map(movie => (
                movie.isSeries ? (
                  <SeriesCard key={movie.id} series={movie} showGenre />
                ) : (
                  <MovieCard key={movie.id} movie={movie} showGenre />
                )
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No results found for &quot;{searchQuery}&quot;</p>
            </div>
          )}

          {!searchQuery && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Search for movies and series</p>
            </div>
          )}
        </div>
      )
    }

    // Home page (default)
    return (
      <div className="pb-20">
        {/* Hero Banner */}
        {trendingMovies.length > 0 && (
          <HeroBanner movies={trendingMovies} />
        )}

        {/* Trending Movies */}
        {trendingMovies.length > 0 && (
          <HorizontalSection 
            title="Trending Movies" 
            items={trendingMovies}
            seeAllHref="/movies"
            type="movie"
          />
        )}

        {/* Trending Series */}
        {trendingSeries.length > 0 && (
          <HorizontalSection 
            title="Trending Series" 
            items={trendingSeries}
            seeAllHref="/series"
            type="series"
          />
        )}

        {/* Movies */}
        {moviesOnly.length > 0 && (
          <HorizontalSection 
            title="Movies" 
            items={moviesOnly}
            seeAllHref="/movies"
            type="movie"
          />
        )}

        {/* Series */}
        {seriesOnly.length > 0 && (
          <HorizontalSection 
            title="Series" 
            items={seriesOnly}
            seeAllHref="/series"
            type="series"
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">{headerText}</h1>
          <button 
            onClick={handleSearchClick}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {renderPageContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Sidebar */}
      <SidebarMenu 
        open={sidebarOpen} 
        onOpenChange={setSidebarOpen}
        onLoginClick={() => setShowLogin(true)}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Login Modal */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="max-w-sm bg-[#1E1E1E] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Login</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Username</Label>
              <Input 
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="bg-secondary border-white/10"
                placeholder="Enter username"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <Label className="text-gray-400">Password</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-secondary border-white/10 pr-10"
                  placeholder="Enter password"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button 
              className="w-full"
              style={{ backgroundColor: primaryColor, color: 'black' }}
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md bg-[#1E1E1E] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {user?.isAdmin && (
              <>
                <div>
                  <Label className="text-gray-400">Primary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      type="color"
                      value={settingsColor}
                      onChange={(e) => setSettingsColor(e.target.value)}
                      className="w-16 h-10 p-1 bg-secondary border-white/10"
                    />
                    <Input 
                      value={settingsColor}
                      onChange={(e) => setSettingsColor(e.target.value)}
                      className="bg-secondary border-white/10"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400">Header Text</Label>
                  <Input 
                    value={settingsHeaderText}
                    onChange={(e) => setSettingsHeaderText(e.target.value)}
                    className="bg-secondary border-white/10"
                  />
                </div>
              </>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">All Download</Label>
                <p className="text-gray-400 text-xs">Enable to show download links</p>
              </div>
              <Switch 
                checked={allDownloadEnabled}
                onCheckedChange={setAllDownloadEnabled}
              />
            </div>

            {user?.isAdmin && (
              <Button 
                className="w-full"
                style={{ backgroundColor: primaryColor, color: 'black' }}
                onClick={saveSettings}
              >
                Save Settings
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
