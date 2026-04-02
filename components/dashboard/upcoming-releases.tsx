"use client"

import { useState, useEffect } from "react"
import { Disc3, Share2, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Release {
  id: string
  artist: string
  title: string
  releaseDate: string
  genre: string
  type: "album" | "ep" | "single"
  streamingLink: string
  artistOrigin: string
}

// Empty array - real release data would be fetched from an API
const mockReleases: Release[] = []

export function UpcomingReleases() {
  const [releases] = useState<Release[]>(mockReleases)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const shareRelease = async (release: Release) => {
    const shareText = `${release.artist} - "${release.title}" (${release.type.toUpperCase()}) - New ${release.genre} release from ${release.artistOrigin}, NJ`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${release.artist} - ${release.title}`,
          text: shareText,
          url: release.streamingLink
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(`${shareText}\nListen: ${release.streamingLink}`)
          setCopiedId(release.id)
          setTimeout(() => setCopiedId(null), 2000)
        }
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\nListen: ${release.streamingLink}`)
      setCopiedId(release.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const getDaysUntilRelease = (date: string) => {
    if (!mounted) return null
    const [year, month, day] = date.split("-").map(Number)
    const releaseDate = new Date(year, month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = releaseDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredReleases = releases
    .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime())

  return (
    <div>
      <div className="space-y-3">
        {filteredReleases.map((release) => {
          const daysUntil = getDaysUntilRelease(release.releaseDate)
          return (
            <article
              key={release.id}
              className="group border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-foreground">{release.artist}</h4>
                    <Badge variant="secondary" className="text-[9px] font-normal px-1.5 py-0">
                      {release.artistOrigin}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0">
                      {release.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground italic">{release.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {daysUntil <= 0 ? "Out now" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => shareRelease(release)}
                  >
                    {copiedId === release.id ? (
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
                    <a href={release.streamingLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          )
        })}
        {filteredReleases.length === 0 && (
          <div className="py-8 text-center">
            <Disc3 className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No upcoming releases to display
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Connect to a data source to see real release announcements
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
