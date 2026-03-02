'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Movie } from '@/store'

interface DownloadLink {
  id: string
  source: string
  quality: string
  url: string
  isNew?: boolean
}

interface Episode {
  id: string
  episodeNumber: number
  title: string
  downloadLinks: DownloadLink[]
}

interface Season {
  id: string
  seasonNumber: number
  episodes: Episode[]
}

interface SeriesEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  series: Movie | null
  onUpdate: () => void
}

export function SeriesEditModal({ open, onOpenChange, series, onUpdate }: SeriesEditModalProps) {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState<number>(1)
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null)
  const [episodeLinks, setEpisodeLinks] = useState<DownloadLink[]>([])
  const [loading, setLoading] = useState(false)
  const [newSource, setNewSource] = useState('')
  const [newQuality, setNewQuality] = useState('')
  const [newUrl, setNewUrl] = useState('')

  // Load seasons when modal opens
  useEffect(() => {
    if (series && open) {
      const seriesSeasons: Season[] = (series.series?.seasons || []).map(season => ({
        id: season.id,
        seasonNumber: season.seasonNumber,
        episodes: season.episodes.map(ep => ({
          id: ep.id,
          episodeNumber: ep.episodeNumber,
          title: ep.title,
          downloadLinks: (ep.downloadLinks || []).map(link => ({
            id: link.id,
            source: link.source || '',
            quality: link.quality,
            url: link.url,
          })),
        })),
      }))
      setSeasons(seriesSeasons)
      if (seriesSeasons.length > 0) {
        setSelectedSeason(seriesSeasons[0].seasonNumber)
      }
      setSelectedEpisode(null)
      setEpisodeLinks([])
      setNewSource('')
      setNewQuality('')
      setNewUrl('')
    }
  }, [series, open])

  // Get current season
  const currentSeason = seasons.find(s => s.seasonNumber === selectedSeason)

  // Handle episode selection
  const handleEpisodeSelect = (episodeId: string) => {
    setSelectedEpisode(episodeId)
    const episode = currentSeason?.episodes.find(ep => ep.id === episodeId)
    if (episode) {
      setEpisodeLinks(episode.downloadLinks)
    }
    setNewSource('')
    setNewQuality('')
    setNewUrl('')
  }

  // Add new download link
  const handleAddLink = () => {
    if (!newUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }
    if (!newQuality.trim()) {
      toast.error('Please enter quality')
      return
    }
    if (!selectedEpisode) {
      toast.error('Please select an episode first')
      return
    }

    const newLink: DownloadLink = {
      id: `temp-${Date.now()}`,
      source: newSource.trim(),
      quality: newQuality.trim(),
      url: newUrl.trim(),
      isNew: true,
    }

    setEpisodeLinks(prev => [...prev, newLink])
    setNewSource('')
    setNewQuality('')
    setNewUrl('')
    toast.success('Link added')
  }

  // Remove link
  const handleRemoveLink = async (link: DownloadLink) => {
    if (link.isNew) {
      setEpisodeLinks(prev => prev.filter(l => l.id !== link.id))
      return
    }

    try {
      const res = await fetch(`/api/download-links?id=${link.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setEpisodeLinks(prev => prev.filter(l => l.id !== link.id))
        toast.success('Link deleted')
      } else {
        toast.error('Failed to delete')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete')
    }
  }

  // Update link field
  const updateLinkField = (id: string, field: keyof DownloadLink, value: string) => {
    setEpisodeLinks(prev => prev.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ))
  }

  // Save all changes
  const handleSave = async () => {
    if (!selectedEpisode) {
      toast.error('Please select an episode first')
      return
    }
    
    setLoading(true)

    try {
      const newLinks = episodeLinks.filter(l => l.isNew)
      
      for (const link of newLinks) {
        await fetch('/api/download-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            episodeId: selectedEpisode,
            source: link.source,
            quality: link.quality,
            url: link.url,
          }),
        })
      }

      const existingLinks = episodeLinks.filter(l => !l.isNew)
      
      for (const link of existingLinks) {
        await fetch('/api/download-links', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: link.id,
            source: link.source,
            quality: link.quality,
            url: link.url,
          }),
        })
      }

      toast.success('Saved successfully')
      onUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" />
      
      {/* Modal */}
      <div 
        className="relative bg-[#1a1a1a] rounded-lg w-[90%] max-w-md max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg">Edit Series</h2>
          <button 
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Series Title */}
          <div className="mb-4">
            <label className="text-gray-400 text-xs">Title</label>
            <div className="text-white font-medium mt-1">{series?.title}</div>
          </div>

          {/* Season Selector */}
          {seasons.length > 0 && (
            <div className="mb-4">
              <label className="text-gray-400 text-xs mb-2 block">Select Season</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {seasons.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSeason(s.seasonNumber)
                      setSelectedEpisode(null)
                      setEpisodeLinks([])
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      selectedSeason === s.seasonNumber
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    Season {s.seasonNumber}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Episode Selector */}
          {currentSeason && (
            <div className="mb-4">
              <label className="text-gray-400 text-xs mb-2 block">Select Episode</label>
              <div className="grid grid-cols-5 gap-2 max-h-28 overflow-y-auto">
                {currentSeason.episodes.map(ep => (
                  <button
                    key={ep.id}
                    onClick={() => handleEpisodeSelect(ep.id)}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedEpisode === ep.id
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    Ep {ep.episodeNumber}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Download Links Section */}
          {selectedEpisode && (
            <>
              {/* Existing Links */}
              {episodeLinks.length > 0 && (
                <div className="mb-4">
                  <label className="text-gray-400 text-xs mb-2 block">Download Links</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {episodeLinks.map((link) => (
                      <div key={link.id} className="bg-gray-800 rounded-lg p-3 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Server"
                            value={link.source}
                            onChange={(e) => updateLinkField(link.id, 'source', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white text-sm h-9"
                          />
                          <Input
                            placeholder="Quality"
                            value={link.quality}
                            onChange={(e) => updateLinkField(link.id, 'quality', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white text-sm h-9 w-20"
                          />
                          <button
                            onClick={() => handleRemoveLink(link)}
                            className="w-9 h-9 rounded bg-red-500/20 flex items-center justify-center shrink-0"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                        <Input
                          placeholder="URL"
                          value={link.url}
                          onChange={(e) => updateLinkField(link.id, 'url', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white text-sm h-9"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Link */}
              <div className="bg-gray-800/50 rounded-lg p-3 border border-dashed border-gray-600">
                <p className="text-gray-400 text-xs mb-2">Add New Download Link</p>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Server (e.g., Yoteshin)"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white text-sm h-9"
                  />
                  <Input
                    placeholder="Quality"
                    value={newQuality}
                    onChange={(e) => setNewQuality(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white text-sm h-9 w-20"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Download URL"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white text-sm h-9 flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddLink}
                    className="h-9 px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* No Episode Selected */}
          {!selectedEpisode && currentSeason && (
            <div className="text-center py-6 text-gray-400 text-sm">
              Select an episode to manage download links
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-800">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !selectedEpisode}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
