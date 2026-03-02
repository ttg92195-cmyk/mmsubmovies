'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Film, Tv, Search, RefreshCw, Star, Plus, 
  Loader2, AlertCircle, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { useAppStore } from '@/store'
import { BottomNav } from '@/components/movie/BottomNav'

interface TMDBMovie {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  overview: string
  genre_ids: number[]
}

interface TMDBGenre {
  id: number
  name: string
}

// Error Boundary Component
function ErrorFallback({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <p className="text-white text-lg mb-2">Something went wrong</p>
      <p className="text-gray-400 text-sm text-center mb-4">{error}</p>
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    </div>
  )
}

export default function TMDBPage() {
  const router = useRouter()
  const { user, primaryColor } = useAppStore()
  
  // State
  const [tmdbType, setTmdbType] = useState<string>('movie')
  const [tmdbYear, setTmdbYear] = useState<string>('2024')
  const [tmdbGenre, setTmdbGenre] = useState<string>('all')
  const [tmdbPage, setTmdbPage] = useState<string>('1')
  const [tmdbSearch, setTmdbSearch] = useState<string>('')
  const [tmdbResults, setTmdbResults] = useState<TMDBMovie[]>([])
  const [tmdbGenres, setTmdbGenres] = useState<TMDBGenre[]>([])
  const [selectedTMDB, setSelectedTMDB] = useState<number[]>([])
  const [tmdbLoading, setTmdbLoading] = useState<boolean>(false)
  const [tmdbImporting, setTmdbImporting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null)

  // Check if user is admin
  useEffect(() => {
    if (!user?.isAdmin) {
      toast.error('Admin access required')
      router.push('/')
    }
  }, [user, router])

  // Fetch genres when type changes
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(`/api/tmdb?action=genres&type=${tmdbType}`)
        const data = await res.json()
        if (data.success && data.data?.genres) {
          setTmdbGenres(data.data.genres)
        } else {
          setTmdbGenres([])
        }
      } catch (err) {
        console.error('Failed to fetch genres:', err)
        setTmdbGenres([])
      }
    }
    
    if (user?.isAdmin) {
      fetchGenres()
    }
  }, [tmdbType, user?.isAdmin])

  // Handle discover
  const handleDiscover = useCallback(async () => {
    if (tmdbLoading) return
    
    setError(null)
    setTmdbLoading(true)
    setTmdbResults([])
    
    try {
      let url = `/api/tmdb?action=discover&type=${tmdbType}&page=${tmdbPage}`
      if (tmdbYear) url += `&year=${tmdbYear}`
      if (tmdbGenre && tmdbGenre !== 'all') url += `&genre=${tmdbGenre}`
      
      const res = await fetch(url)
      const data = await res.json()
      
      if (data.success && Array.isArray(data.data?.results)) {
        setTmdbResults(data.data.results)
        if (data.data.results.length === 0) {
          toast.info('No results found')
        }
      } else {
        setError(data.message || 'Failed to fetch results')
        setTmdbResults([])
      }
    } catch (err) {
      console.error('Discover error:', err)
      setError('Failed to connect to TMDB. Please try again.')
      setTmdbResults([])
    } finally {
      setTmdbLoading(false)
    }
  }, [tmdbType, tmdbPage, tmdbYear, tmdbGenre, tmdbLoading])

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!tmdbSearch.trim()) {
      toast.error('Please enter a search term')
      return
    }
    
    if (tmdbLoading) return
    
    setError(null)
    setTmdbLoading(true)
    setTmdbResults([])
    
    try {
      const res = await fetch(`/api/tmdb?action=search&type=${tmdbType}&query=${encodeURIComponent(tmdbSearch)}`)
      const data = await res.json()
      
      if (data.success && Array.isArray(data.data?.results)) {
        setTmdbResults(data.data.results)
        if (data.data.results.length === 0) {
          toast.info('No results found')
        }
      } else {
        setError(data.message || 'Search failed')
        setTmdbResults([])
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search TMDB. Please try again.')
      setTmdbResults([])
    } finally {
      setTmdbLoading(false)
    }
  }, [tmdbSearch, tmdbType, tmdbLoading])

  // Toggle selection
  const toggleSelection = useCallback((id: number) => {
    setSelectedTMDB(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }, [])

  // Select all
  const selectAll = useCallback(() => {
    if (tmdbResults.length > 0) {
      setSelectedTMDB(tmdbResults.map(r => r.id))
    }
  }, [tmdbResults])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedTMDB([])
  }, [])

  // Import selected
  const handleImport = useCallback(async () => {
    if (selectedTMDB.length === 0) {
      toast.error('Please select items to import')
      return
    }
    
    if (tmdbImporting) return
    
    setTmdbImporting(true)
    setImportProgress({ current: 0, total: selectedTMDB.length })
    
    let imported = 0
    let failed = 0
    
    for (let i = 0; i < selectedTMDB.length; i++) {
      const tmdbId = selectedTMDB[i]
      setImportProgress({ current: i + 1, total: selectedTMDB.length })
      
      try {
        // Get detailed info
        const detailRes = await fetch('/api/tmdb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tmdbId, type: tmdbType })
        })
        const detailData = await detailRes.json()
        
        if (detailData.success && detailData.data) {
          // Save to database
          const saveRes = await fetch('/api/movies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(detailData.data)
          })
          const saveData = await saveRes.json()
          
          if (saveData.success) {
            imported++
          } else {
            failed++
          }
        } else {
          failed++
        }
      } catch (err) {
        console.error('Import error for', tmdbId, err)
        failed++
      }
    }
    
    setImportProgress(null)
    setTmdbImporting(false)
    
    if (imported > 0) {
      toast.success(`Successfully imported ${imported} item${imported > 1 ? 's' : ''}`)
      // Navigate to home after successful import
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }
    if (failed > 0) {
      toast.error(`Failed to import ${failed} item${failed > 1 ? 's' : ''}`)
    }
    
    setSelectedTMDB([])
  }, [selectedTMDB, tmdbType, tmdbImporting, router])

  // Get display title
  const getTitle = (item: TMDBMovie): string => {
    return item.title || item.name || 'Unknown'
  }

  // If not admin, don't render
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3 p-4">
          <Link 
            href="/"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">TMDB Generator</h1>
            <p className="text-xs text-gray-400">Import movies and series from TMDB</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {/* Filters Section */}
        <div className="p-4 border-b border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {/* Type Selector */}
            <div>
              <Label className="text-gray-400 text-xs mb-1 block">Type</Label>
              <Select value={tmdbType} onValueChange={setTmdbType}>
                <SelectTrigger className="bg-secondary border-white/10 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="movie">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4" />
                      <span>Movies</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="tv">
                    <div className="flex items-center gap-2">
                      <Tv className="w-4 h-4" />
                      <span>Series</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year Selector */}
            <div>
              <Label className="text-gray-400 text-xs mb-1 block">Year</Label>
              <Select value={tmdbYear} onValueChange={setTmdbYear}>
                <SelectTrigger className="bg-secondary border-white/10 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 27 }, (_, i) => 2000 + i).reverse().map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Genre Selector */}
            <div>
              <Label className="text-gray-400 text-xs mb-1 block">Genre</Label>
              <Select value={tmdbGenre} onValueChange={setTmdbGenre}>
                <SelectTrigger className="bg-secondary border-white/10 h-10">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {tmdbGenres.map(g => (
                    <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Page Input */}
            <div>
              <Label className="text-gray-400 text-xs mb-1 block">Page</Label>
              <Input 
                type="number"
                value={tmdbPage}
                onChange={(e) => setTmdbPage(e.target.value)}
                className="bg-secondary border-white/10 h-10"
                min="1"
                max="500"
              />
            </div>
          </div>

          {/* Search Input */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                value={tmdbSearch}
                onChange={(e) => setTmdbSearch(e.target.value)}
                placeholder="Search movies or series..."
                className="bg-secondary border-white/10 pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleSearch} 
              disabled={tmdbLoading}
              className="shrink-0"
            >
              {tmdbLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* Discover Button */}
          <Button 
            className="w-full h-11"
            style={{ backgroundColor: primaryColor, color: 'black' }}
            onClick={handleDiscover}
            disabled={tmdbLoading}
          >
            {tmdbLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Discover
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorFallback error={error} onRetry={handleDiscover} />
        )}

        {/* Results Section */}
        {tmdbResults.length > 0 && !error && (
          <div className="p-4">
            {/* Results Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">Results</span>
                <Badge variant="secondary" className="text-xs">
                  {tmdbResults.length}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={selectedTMDB.length === tmdbResults.length ? clearSelection : selectAll}
                >
                  {selectedTMDB.length === tmdbResults.length ? 'Clear All' : 'Select All'}
                </Button>
                <Button 
                  size="sm"
                  style={{ backgroundColor: primaryColor, color: 'black' }}
                  onClick={handleImport}
                  disabled={selectedTMDB.length === 0 || tmdbImporting}
                >
                  {tmdbImporting ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      {importProgress && `${importProgress.current}/${importProgress.total}`}
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 mr-1" />
                      Import ({selectedTMDB.length})
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Import Progress */}
            {tmdbImporting && importProgress && (
              <div className="mb-4 p-3 rounded-lg bg-secondary">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Importing...</span>
                  <span className="text-sm text-white">{importProgress.current} / {importProgress.total}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300 rounded-full"
                    style={{ 
                      width: `${(importProgress.current / importProgress.total) * 100}%`,
                      backgroundColor: primaryColor 
                    }}
                  />
                </div>
              </div>
            )}

            {/* Results Grid */}
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {tmdbResults.map((movie) => {
                  const isSelected = selectedTMDB.includes(movie.id)
                  const title = getTitle(movie)
                  
                  return (
                    <div 
                      key={movie.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected ? 'ring-2' : 'border-transparent'
                      }`}
                      style={{ 
                        borderColor: isSelected ? primaryColor : 'transparent',
                        ['--tw-ring-color' as string]: isSelected ? `${primaryColor}40` : undefined
                      }}
                      onClick={() => toggleSelection(movie.id)}
                    >
                      <div className="aspect-[2/3] relative bg-secondary">
                        {movie.poster_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
                            alt={title} 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-8 h-8 text-gray-500" />
                          </div>
                        )}
                        
                        {/* Selection Overlay */}
                        {isSelected && (
                          <div 
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ backgroundColor: `${primaryColor}30` }}
                          >
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: primaryColor }}
                            >
                              <CheckCircle className="w-6 h-6 text-black" />
                            </div>
                          </div>
                        )}
                        
                        {/* Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
                          <p className="text-white text-xs font-medium truncate">{title}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-white text-xs">
                              {movie.vote_average?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Empty State */}
        {tmdbResults.length === 0 && !tmdbLoading && !error && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <RefreshCw className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              Click Discover or search to find content from TMDB
            </p>
          </div>
        )}

        {/* Loading State */}
        {tmdbLoading && tmdbResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: primaryColor }} />
            <p className="text-gray-400">Loading from TMDB...</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
