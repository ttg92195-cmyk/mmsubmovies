'use client'

import { useState, useEffect, useCallback } from 'react'
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
  ChevronDown,
} from 'lucide-react'
import { SeriesEditModal } from './SeriesEditModal'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore, Movie } from '@/store'
import { toast } from 'sonner'
import { BottomNav } from '@/components/movie/BottomNav'

interface SeriesDetailContentProps {
  seriesId: string
}

interface Episode {
  id: string
  episodeNumber: number
  title: string
  thumbnailUrl?: string | null
  duration?: number | null
  overview?: string | null
  downloadLinks: { id: string; quality: string; url: string; source: string }[]
}

interface Season {
  id: string
  seasonNumber: number
  episodes: Episode[]
}

export function SeriesDetailContent({ seriesId }: SeriesDetailContentProps) {
  const router = useRouter()
  const {
    primaryColor,
    allDownloadEnabled,
    user,
    isBookmarked,
    addBookmark,
    removeBookmark,
  } = useAppStore()

  const [series, setSeries] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'synopsis' | 'cast'>('synopsis')
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const fetchSeries = useCallback(async () => {
    try {
      const res = await fetch(`/api/movies/${seriesId}`)
      const data = await res.json()
      if (data.success && data.data.isSeries) {
        setSeries(data.data)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching series:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [seriesId, router])

  useEffect(() => {
    fetchSeries()
  }, [fetchSeries])

  const handleBack = () => {
    router.back()
  }

  const handleToggleBookmark = () => {
    if (!series) return
    
    if (isBookmarked(series.id)) {
      removeBookmark(series.id)
      toast.success('Removed from bookmarks')
    } else {
      addBookmark(series.id)
      toast.success('Added to bookmarks')
    }
  }

  const handleEpisodeClick = (episode: Episode) => {
    setSelectedEpisode(selectedEpisode?.id === episode.id ? null : episode)
  }

  const handleDelete = async () => {
    if (!series || !user?.isAdmin) return
    if (!confirm('Are you sure you want to delete this?')) return
    
    try {
      await fetch(`/api/movies/${series.id}`, { method: 'DELETE' })
      toast.success('Deleted successfully')
      router.push('/')
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Series not found</p>
      </div>
    )
  }

  const bookmarked = isBookmarked(series.id)
  const genres = series.genre ? series.genre.split(', ').filter(Boolean) : []
  const seasons: Season[] = series.series?.seasons || []
  const currentSeason = seasons.find(s => s.seasonNumber === selectedSeason) || seasons[0]

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Backdrop */}
      <div className="relative w-full h-48">
        {series.backdropUrl ? (
          <Image
            src={series.backdropUrl}
            alt={series.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        
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

      {/* Poster & Info Section */}
      <div className="relative px-4 -mt-24">
        <div className="flex gap-4">
          {/* Poster */}
          <div className="w-[130px] flex-shrink-0">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              {series.posterUrl ? (
                <Image
                  src={series.posterUrl}
                  alt={series.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <Tv className="w-10 h-10 text-gray-600" />
                </div>
              )}
            </div>
          </div>
          
          {/* Info */}
          <div className="flex-1 pt-28 min-w-0">
            <h1 className="text-xl font-bold text-white leading-tight line-clamp-2">{series.title}</h1>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                <span className="text-yellow-500 font-bold text-sm">{series.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-400 text-sm">{series.year}</span>
              {seasons.length > 0 && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400 text-sm">{seasons.length} Season{seasons.length > 1 ? 's' : ''}</span>
                </>
              )}
            </div>
            
            {/* Genre Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {genres.map(g => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400"
                >
                  {g}
                </span>
              ))}
              {series.series?.status && (
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium border"
                  style={{ 
                    borderColor: primaryColor, 
                    color: primaryColor,
                    backgroundColor: `${primaryColor}15`
                  }}
                >
                  {series.series.status}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6">
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('synopsis')}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'synopsis' ? 'bg-gray-800 text-white' : 'text-gray-400'
            }`}
          >
            Synopsis
          </button>
          <button
            onClick={() => setActiveTab('cast')}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'cast' ? 'bg-gray-800 text-white' : 'text-gray-400'
            }`}
          >
            Cast List
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-4">
        {activeTab === 'synopsis' ? (
          <div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {series.overview || 'No synopsis available.'}
            </p>
          </div>
        ) : (
          <div>
            {series.cast && series.cast.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {series.cast.map(c => (
                  <div key={c.id} className="text-center">
                    <div className="w-14 h-14 mx-auto rounded-full overflow-hidden bg-gray-800 ring-1 ring-white/10">
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
                    <p className="text-white text-xs mt-1.5 truncate">{c.name}</p>
                    <p className="text-gray-500 text-[10px] truncate">{c.character}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No cast information</p>
            )}
          </div>
        )}
      </div>

      {/* Season Selector */}
      {seasons.length > 0 && (
        <div className="px-4 mt-6">
          <h3 className="font-bold text-sm mb-3" style={{ color: primaryColor }}>EPISODES</h3>
          
          {/* Season Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {seasons.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSeason(s.seasonNumber)
                  setSelectedEpisode(null)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedSeason === s.seasonNumber
                    ? 'text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                style={{
                  backgroundColor: selectedSeason === s.seasonNumber ? primaryColor : undefined
                }}
              >
                Season {s.seasonNumber}
              </button>
            ))}
          </div>

          {/* Episode List */}
          <div className="mt-3 space-y-2">
            {currentSeason?.episodes?.map(ep => (
              <div key={ep.id}>
                {/* Episode Card */}
                <button
                  onClick={() => handleEpisodeClick(ep)}
                  className={`w-full flex gap-3 p-2 rounded-lg transition-all ${
                    selectedEpisode?.id === ep.id 
                      ? 'bg-gray-800 ring-1 ring-white/20' 
                      : 'bg-gray-900/50 hover:bg-gray-800'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-800 relative">
                    {ep.thumbnailUrl ? (
                      <Image
                        src={ep.thumbnailUrl}
                        alt={ep.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <Play className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      Ep {ep.episodeNumber}. {ep.title || `Episode ${ep.episodeNumber}`}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {ep.duration ? `${ep.duration} min` : ''}
                    </p>
                  </div>
                  
                  {/* Download Indicator */}
                  {allDownloadEnabled && ep.downloadLinks?.length > 0 && (
                    <div className="flex items-center px-2">
                      <Download className="w-4 h-4" style={{ color: primaryColor }} />
                    </div>
                  )}
                </button>

                {/* Download Links (Expanded) */}
                {selectedEpisode?.id === ep.id && allDownloadEnabled && ep.downloadLinks?.length > 0 && (
                  <div className="mt-1 ml-2 bg-gray-900 rounded-lg overflow-hidden">
                    {ep.downloadLinks.map((link, idx) => (
                      <div 
                        key={link.id}
                        className={`flex items-center justify-between px-3 py-2.5 ${idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-white text-sm font-medium">{link.source || `Server ${idx + 1}`}</span>
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs">
                            {link.quality}
                          </span>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-black"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Warning */}
      {!allDownloadEnabled && (
        <div className="px-4 mt-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-400 text-xs">
              ⚠️ Enable &quot;All Download&quot; in Menu → Download to access download links
            </p>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      {user?.isAdmin && (
        <div className="px-4 mt-6 flex gap-2">
          <button 
            onClick={() => setShowEditModal(true)}
            className="flex-1 py-2.5 rounded-lg bg-gray-800 text-white text-sm font-medium"
          >
            Edit
          </button>
          <button 
            onClick={handleDelete}
            className="flex-1 py-2.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <SeriesEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        series={series}
        onUpdate={fetchSeries}
      />

      <BottomNav />
    </div>
  )
}
