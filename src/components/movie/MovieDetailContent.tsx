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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SourcesModal } from '@/components/movie/SourcesModal'
import { useAppStore, Movie } from '@/store'
import { toast } from 'sonner'

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

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header with Backdrop */}
      <div className="relative">
        {/* Backdrop Image - aspect video ratio */}
        <div className="relative w-full aspect-video">
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
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Back Button - overlay on backdrop */}
        <button
          onClick={handleBack}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm z-10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Bookmark Button - overlay on backdrop */}
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

        {/* Poster and Info - overlapping backdrop */}
        <div className="absolute bottom-0 left-0 right-0 px-3 flex gap-3 transform translate-y-1/2">
          {/* Poster */}
          <div className="w-[100px] flex-shrink-0">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl ring-1 ring-white/10">
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
                    <Tv className="w-8 h-8 text-gray-500" />
                  ) : (
                    <User className="w-8 h-8 text-gray-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-lg font-bold text-white line-clamp-2">{movie.title}</h1>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              <span className="text-white">{movie.rating.toFixed(1)}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">{movie.year}</span>
              {movie.duration && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">{movie.duration} min</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {movie.genre.split(', ').slice(0, 3).map(g => (
                <Badge key={g} variant="secondary" className="text-[10px] px-2 py-0.5">{g}</Badge>
              ))}
              {movie.isSeries && movie.series && (
                <Badge variant="outline" className="text-[10px] px-2 py-0.5" style={{ borderColor: primaryColor, color: primaryColor }}>
                  {movie.series.status}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content - starts after poster overlap */}
      <div className="px-3 mt-20">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            className="flex-1 h-10"
            style={{ backgroundColor: primaryColor, color: 'black' }}
            onClick={handleWatchNow}
          >
            <Play className="w-4 h-4 mr-1.5" />
            Watch Now
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-10"
            style={{ borderColor: primaryColor, color: primaryColor }}
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-1.5" />
            Download
          </Button>
        </div>

        {/* Download Warning */}
        {!allDownloadEnabled && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2.5 mt-3">
            <p className="text-yellow-400 text-xs">
              Enable &quot;All Download&quot; in Menu → Download to access download links
            </p>
          </div>
        )}

        {/* Synopsis */}
        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-1.5" style={{ color: primaryColor }}>SYNOPSIS</h3>
          <p className="text-gray-300 text-xs leading-relaxed">{movie.overview || 'No synopsis available.'}</p>
        </div>

        {/* Series Episodes */}
        {movie.isSeries && movie.series && movie.series.seasons && movie.series.seasons.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-sm mb-2" style={{ color: primaryColor }}>EPISODES</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-400 text-xs">Season:</span>
              <Select value={selectedSeason.toString()} onValueChange={(v) => setSelectedSeason(parseInt(v))}>
                <SelectTrigger className="w-24 bg-gray-800 border-white/10 h-8 text-xs">
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
                    className="bg-gray-800 rounded-md overflow-hidden cursor-pointer hover:bg-gray-700 active:scale-95 transition-transform"
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
                          <Play className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                          <Play className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <p className="text-white text-[10px] text-center truncate">EP {ep.episodeNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cast */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-sm mb-2" style={{ color: primaryColor }}>CAST</h3>
            <ScrollArea className="w-full">
              <div className="flex gap-3 pb-2">
                {movie.cast.map(c => (
                  <div key={c.id} className="flex-shrink-0 text-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 ring-1 ring-white/10">
                      {c.profileUrl ? (
                        <Image
                          src={c.profileUrl}
                          alt={c.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-white text-[10px] mt-1 truncate w-12">{c.name}</p>
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
    </div>
  )
}
