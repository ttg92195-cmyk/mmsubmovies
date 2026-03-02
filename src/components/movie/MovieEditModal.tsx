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

interface MovieEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  movie: Movie | null
  onUpdate: () => void
}

export function MovieEditModal({ open, onOpenChange, movie, onUpdate }: MovieEditModalProps) {
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([])
  const [loading, setLoading] = useState(false)
  const [newSource, setNewSource] = useState('')
  const [newQuality, setNewQuality] = useState('')
  const [newUrl, setNewUrl] = useState('')

  // Load existing download links when modal opens
  useEffect(() => {
    if (movie && open) {
      const links: DownloadLink[] = (movie.downloadLinks || []).map(link => ({
        id: link.id,
        source: link.source || '',
        quality: link.quality,
        url: link.url,
      }))
      setDownloadLinks(links)
      setNewSource('')
      setNewQuality('')
      setNewUrl('')
    }
  }, [movie, open])

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

    const newLink: DownloadLink = {
      id: `temp-${Date.now()}`,
      source: newSource.trim(),
      quality: newQuality.trim(),
      url: newUrl.trim(),
      isNew: true,
    }

    setDownloadLinks(prev => [...prev, newLink])
    setNewSource('')
    setNewQuality('')
    setNewUrl('')
    toast.success('Link added')
  }

  // Remove link
  const handleRemoveLink = async (link: DownloadLink) => {
    if (link.isNew) {
      setDownloadLinks(prev => prev.filter(l => l.id !== link.id))
      return
    }

    try {
      const res = await fetch(`/api/download-links?id=${link.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setDownloadLinks(prev => prev.filter(l => l.id !== link.id))
        toast.success('Link deleted')
      } else {
        toast.error('Failed to delete')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete')
    }
  }

  // Save all changes
  const handleSave = async () => {
    if (!movie) return
    setLoading(true)

    try {
      const newLinks = downloadLinks.filter(l => l.isNew)
      
      for (const link of newLinks) {
        await fetch('/api/download-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            movieId: movie.id,
            source: link.source,
            quality: link.quality,
            url: link.url,
          }),
        })
      }

      const existingLinks = downloadLinks.filter(l => !l.isNew)
      
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

  // Update link field
  const updateLinkField = (id: string, field: keyof DownloadLink, value: string) => {
    setDownloadLinks(prev => prev.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ))
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
          <h2 className="text-white font-bold text-lg">Edit Movie</h2>
          <button 
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Movie Title */}
          <div className="mb-4">
            <label className="text-gray-400 text-xs">Title</label>
            <div className="text-white font-medium mt-1">{movie?.title}</div>
          </div>

          {/* Existing Download Links */}
          {downloadLinks.length > 0 && (
            <div className="mb-4">
              <label className="text-gray-400 text-xs mb-2 block">Download Links</label>
              <div className="space-y-2">
                {downloadLinks.map((link) => (
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
            disabled={loading}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
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
