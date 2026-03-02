'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Play,
  Download,
  Star,
  Bookmark,
  BookmarkCheck,
  User,
  Tv,
  Edit,
  Trash2,
  Clock,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SourcesModal } from '@/components/movie/SourcesModal'
import { useAppStore, Movie } from '@/store'
import { toast } from 'sonner'
import { BottomNav } from '@/components/movie/BottomNav'

interface MovieDetailContentProps {
  movieId: string
  type: 'movie' | 'series'
}

export function MovieDetailContent({ movieId, type }: MovieDetailContentProps) {
  const router = useRouter()
  const {
    primaryColor,
    allDownloadEnabled,
    user,
    isBookmarked,
    addBookmark,
    removeBookmark,
  } = useAppStore()

  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [showSources, setShowSources] = useState(false)
  const [selectedLinks, setSelectedLinks] = useState<{ id: string; quality: string; url: string }[]>([])

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`/api/movies/${movieId}`)
        const data = await res.json()
        if (data.success) {
          setMovie(data.data)
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Error fetching movie:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [movieId, router])

  const handleBack = () => {
    router.back()
  }

  const handleToggleBookmark = () => {
    if (!movie) return
    
    if (isBookmarked(movie.id)) {
      removeBookmark(movie.id)
      toast.success('Removed from bookmarks')
    } else {
      addBookmark(movie.id)
      toast.success('Added to bookmarks')
    }
  }

  const handleWatchNow = () => {
    if (!movie) return
    setSelectedLinks(movie.downloadLinks || [])
    setShowSources(true)
  }

  const handleDownload = () => {
    if (!movie) return
    
    if (!allDownloadEnabled) {
      toast.error('Enable "All Download" in Menu → Download to access downloads')
      return
    }
    
    setSelectedLinks(movie.downloadLinks || [])
    setShowSources(true)
  }

  const handleDelete = async () => {
    if (!movie || !user?.isAdmin) return
    
    if (!confirm('Are you sure you want to delete this?')) return
    
    try {
      await fetch(`/api/movies/${movie.id}`, { method: 'DELETE' })
      toast.success('Deleted successfully')
      router.push('/')
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleEpisodeClick = (episode: Movie['series'] extends { seasons: { episodes: infer E }[] }[] | null ? E : never) => {
    if (!allDownloadEnabled) {
      toast.error('Enable "All Download" in Menu → Download to access downloads')
      return
    }
    
    const links = episode?.downloadLinks || []
    if (links.length > 0) {
      setSelectedLinks(links)
      setShowSources(true)
    } else {
      toast.info('No sources available for this episode')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Content not found</p>
      </div>
    )
  }

  const currentSeason = movie.series?.seasons?.find(s => s.seasonNumber === selectedSeason)
  const bookmarked = isBookmarked(movie.id)
  const genres = movie.genre ? movie.genre.split(', ').filter(Boolean) : []

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Backdrop */}
      <div className="relative w-full h-56">
        {movie.backdropUrl ? (
          <Image
            src={movie.backdropUrl}
            alt={movie.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm z-10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        
        {/* Bookmark Button */}
        <button
          onClick={handleToggleBookmark}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm z-10"
        >
          {bookmarked ? (
            <BookmarkCheck className="w-5 h-5" style={{ color: primaryColor }} />
          ) : (
            <Bookmark className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="relative px-4 -mt-20">
        {/* Poster and Info */}
        <div className="flex gap-4">
          {/* Poster */}
          <div className="w-[120px] flex-shrink-0">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              {movie.posterUrl ? (
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  {movie.isSeries ? (
                    <Tv className="w-10 h-10 text-gray-600" />
                  ) : (
                    <User className="w-10 h-10 text-gray-600" />
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Info */}
          <div className="flex-1 pt-16 min-w-0">
            <h1 className="text-xl font-bold text-white leading-tight line-clamp-2">{movie.title}</h1>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-white font-medium">{movie.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-300">{movie.year}</span>
              {movie.duration && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {movie.duration} min
                  </span>
                </>
              )}
            </div>
            
            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {genres.slice(0, 3).map(g => (
                <Badge 
                  key={g} 
                  variant="secondary" 
                  className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-200 border-0"
                >
                  {g}
                </Badge>
              ))}
              {movie.isSeries && movie.series && (
                <Badge 
                  variant="outline" 
                  className="text-[10px] px-2 py-0.5"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  {movie.series.status}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            className="flex-1 h-11 text-black font-semibold"
            style={{ backgroundColor: primaryColor }}
            onClick={handleWatchNow}
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            Watch Now
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-11 font-semibold"
            style={{ borderColor: primaryColor, color: primaryColor }}
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Download Warning */}
        {!allDownloadEnabled && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
            <p className="text-yellow-400 text-xs">
              ⚠️ Enable &quot;All Download&quot; in Menu → Download to access download links
            </p>
          </div>
        )}

        {/* Synopsis */}
        <div className="mt-6">
          <h3 className="font-bold text-sm mb-2" style={{ color: primaryColor }}>SYNOPSIS</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{movie.overview || 'No synopsis available.'}</p>
        </div>

        {/* Series Episodes */}
        {movie.isSeries && movie.series && movie.series.seasons && movie.series.seasons.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-sm mb-3" style={{ color: primaryColor }}>EPISODES</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-400 text-sm">Season:</span>
              <Select value={selectedSeason.toString()} onValueChange={(v) => setSelectedSeason(parseInt(v))}>
                <SelectTrigger className="w-28 bg-gray-800 border-white/10 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {movie.series.seasons.map(s => (
                    <SelectItem key={s.id} value={s.seasonNumber.toString()}>
                      Season {s.seasonNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {currentSeason && currentSeason.episodes && (
              <div className="grid grid-cols-4 gap-2">
                {currentSeason.episodes.map(ep => (
                  <div
                    key={ep.id}
                    className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 active:scale-95 transition-transform"
                    onClick={() => handleEpisodeClick(ep as never)}
                  >
                    <div className="relative aspect-video">
                      {ep.thumbnailUrl ? (
                        <Image
                          src={ep.thumbnailUrl}
                          alt={ep.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <Play className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-1.5 text-center">
                      <p className="text-white text-[10px] font-medium">EP {ep.episodeNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cast */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-sm mb-3" style={{ color: primaryColor }}>CAST</h3>
            <ScrollArea className="w-full">
              <div className="flex gap-3 pb-2">
                {movie.cast.map(c => (
                  <div key={c.id} className="flex-shrink-0 text-center">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-800 ring-1 ring-white/10">
                      {c.profileUrl ? (
                        <Image
                          src={c.profileUrl}
                          alt={c.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <p className="text-white text-[10px] mt-1 truncate w-14">{c.name}</p>
                    <p className="text-gray-500 text-[9px] truncate w-14">{c.character}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Admin Actions */}
        {user?.isAdmin && (
          <div className="flex gap-2 mt-6 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              <Edit className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Sources Modal */}
      <SourcesModal
        open={showSources}
        onOpenChange={setShowSources}
        downloadLinks={selectedLinks}
        title={movie.title}
      />

      <BottomNav />
    </div>
  )
}
