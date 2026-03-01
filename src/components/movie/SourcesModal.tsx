'use client'

import { Download, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DownloadLink {
  id: string
  quality: string
  url: string
}

interface SourcesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  downloadLinks: DownloadLink[]
  title: string
}

export function SourcesModal({
  open,
  onOpenChange,
  downloadLinks,
  title,
}: SourcesModalProps) {
  if (downloadLinks.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Available Sources</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            <Download className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No download sources available for this content.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle>Available Sources</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-3">
            Select quality for {title}:
          </p>
          
          {downloadLinks.map((link) => (
            <Button
              key={link.id}
              className="w-full justify-between bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                window.open(link.url, '_blank')
                onOpenChange(false)
              }}
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {link.quality}
              </span>
              <span className="text-xs opacity-80">Download</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
