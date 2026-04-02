"use client"

import { useState, useEffect } from "react"
import { Share2, Check, Play, Eye, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MusicVideo {
  id: string
  title: string
  artist: string
  publishedAt: string
  views: string
  link: string
  artistOrigin: string
}

// Empty array - real video data would be fetched from YouTube API
const mockVideos: MusicVideo[] = []

export function NewMusicVideos() {
  const [videos] = useState<MusicVideo[]>(mockVideos)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const shareVideo = async (video: MusicVideo) => {
    const shareText = `"${video.title}" by ${video.artist} (${video.artistOrigin}, NJ) - ${video.views} views`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${video.title} - ${video.artist}`,
          text: shareText,
          url: video.link
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(`${shareText}\nWatch: ${video.link}`)
          setCopiedId(video.id)
          setTimeout(() => setCopiedId(null), 2000)
        }
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\nWatch: ${video.link}`)
      setCopiedId(video.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const getTimeAgo = (date: string) => {
    if (!mounted) return ""
    const [year, month, day] = date.split("-").map(Number)
    const published = new Date(year, month - 1, day)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <div>
      <div className="space-y-4">
        {videos.length === 0 && (
          <div className="py-8 text-center">
            <Play className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No music videos to display
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Connect to YouTube API for real video content
            </p>
          </div>
        )}
        {videos.map((video) => (
          <article
            key={video.id}
            className="group border-b border-border pb-4 last:border-0 last:pb-0"
          >
            <div className="relative aspect-video bg-muted mb-2 overflow-hidden rounded">
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground">
                <Play className="h-8 w-8 mb-2" />
                <span className="text-[10px] uppercase tracking-wider">Video Placeholder</span>
              </div>
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-foreground text-sm">{video.title}</h4>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{video.artist}</p>
                  <Badge variant="secondary" className="text-[8px] font-normal px-1 py-0">
                    {video.artistOrigin}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {video.views}
                  </span>
                  <span>{getTimeAgo(video.publishedAt)}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => shareVideo(video)}
                >
                  {copiedId === video.id ? (
                    <Check className="h-3 w-3 text-primary" />
                  ) : (
                    <Share2 className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  asChild
                >
                  <a href={video.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
