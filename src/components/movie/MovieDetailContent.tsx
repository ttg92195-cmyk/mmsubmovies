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
  Clock,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { MovieEditModal } from './MovieEditModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore, Movie } from '@/store'
import { toast } from 'sonner'
import { BottomNav } from '@/components/movie/BottomNav'

interface MovieDetailContentProps {
  movieId: string
  type: 'movie' | 'series'
}

// Download link type
interface DownloadLink {
  id: string
  quality: string
  url: string
  source: string
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
  const [activeTab, setActiveTab] = useState<'synopsis' | 'cast'>('synopsis')
  const [showEditModal, setShowEditModal] = useState(false)

  const fetchMovie = useCallback(async () => {
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
  }, [movieId, router])

  useEffect(() => {
    fetchMovie()
  }, [fetchMovie])

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

  const bookmarked = isBookmarked(movie.id)
  const genres = movie.genre ? movie.genre.split(', ').filter(Boolean) : []
  const downloadLinks: DownloadLink[] = movie.downloadLinks || []

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Backdrop */}
      <div className="relative w-full h-48">
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
          <div className="flex-1 pt-28 min-w-0">
            <h1 className="text-xl font-bold text-white leading-tight line-clamp-2">{movie.title}</h1>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                <span className="text-yellow-500 font-bold text-sm">{movie.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-400 text-sm">{movie.year}</span>
              {movie.duration && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400 text-sm">{movie.duration} min</span>
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
              activeTab === 'synopsis'
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Synopsis
          </button>
          <button
            onClick={() => setActiveTab('cast')}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'cast'
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white'
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
              {movie.overview || 'No synopsis available.'}
            </p>
          </div>
        ) : (
          <div>
            {movie.cast && movie.cast.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {movie.cast.map(c => (
                  <div key={c.id} className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-gray-800 ring-1 ring-white/10">
                      {c.profileUrl ? (
                        <Image
                          src={c.profileUrl}
                          alt={c.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <p className="text-white text-xs mt-2 truncate">{c.name}</p>
                    <p className="text-gray-500 text-[10px] truncate">{c.character}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No cast information available</p>
            )}
          </div>
        )}
      </div>

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

      {/* Download Table */}
      {allDownloadEnabled && downloadLinks.length > 0 && (
        <div className="px-4 mt-6">
          <h3 className="font-bold text-sm mb-3" style={{ color: primaryColor }}>DOWNLOAD</h3>
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-gray-800 text-xs font-medium text-gray-300">
              <div className="px-3 py-2.5">Server</div>
              <div className="px-3 py-2.5 text-center">Quality</div>
              <div className="px-3 py-2.5 text-center">Action</div>
            </div>
            {/* Table Rows */}
            {downloadLinks.map((link, index) => (
              <div 
                key={link.id} 
                className={`grid grid-cols-3 text-sm ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'}`}
              >
                <div className="px-3 py-3 text-white font-medium">{link.source || `Server ${index + 1}`}</div>
                <div className="px-3 py-3 text-center">
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-medium">
                    {link.quality}
                  </span>
                </div>
                <div className="px-3 py-3 text-center">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-black"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </div>
              </div>
            ))}
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
      <MovieEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        movie={movie}
        onUpdate={fetchMovie}
      />

      <BottomNav />
    </div>
  )
}
