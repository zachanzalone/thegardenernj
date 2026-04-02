"use client"

import { useState } from "react"
import { Share2, Check, ArrowUp, ArrowDown, Minus, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TrendingSong {
  id: string
  rank: number
  title: string
  artist: string
  plays: string
  movement: "up" | "down" | "stable"
  change: number
  genre: string
  artistOrigin: string
}

// Empty array - real trending data would be fetched from an API
const mockSongs: TrendingSong[] = []

export function TrendingSongs() {
  const [songs] = useState<TrendingSong[]>(mockSongs)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const shareSong = async (song: TrendingSong) => {
    const shareText = `#${song.rank} "${song.title}" by ${song.artist} (${song.artistOrigin}, NJ) - ${song.plays} streams`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${song.title} by ${song.artist}`,
          text: shareText
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(shareText)
          setCopiedId(song.id)
          setTimeout(() => setCopiedId(null), 2000)
        }
      }
    } else {
      navigator.clipboard.writeText(shareText)
      setCopiedId(song.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const filteredSongs = songs.sort((a, b) => a.rank - b.rank)

  const MovementIcon = ({ movement, change }: { movement: string; change: number }) => {
    if (movement === "up") {
      return (
        <span className="flex items-center gap-0.5 text-xs text-primary font-medium">
          <ArrowUp className="h-3 w-3" />
          {change}
        </span>
      )
    }
    if (movement === "down") {
      return (
        <span className="flex items-center gap-0.5 text-xs text-destructive">
          <ArrowDown className="h-3 w-3" />
          {change}
        </span>
      )
    }
    return <Minus className="h-3 w-3 text-muted-foreground" />
  }

  return (
    <div>
      <div className="space-y-1">
        {filteredSongs.map((song) => (
          <article
            key={song.id}
            className="group flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center text-sm font-bold text-muted-foreground">
              {song.rank}.
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-medium text-foreground">{song.title}</h4>
              <div className="flex items-center gap-2">
                <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                <Badge variant="secondary" className="text-[8px] font-normal px-1 py-0">
                  {song.artistOrigin}
                </Badge>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs text-muted-foreground">{song.plays}</span>
              <MovementIcon movement={song.movement} change={song.change} />
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => shareSong(song)}
              >
                {copiedId === song.id ? (
                  <Check className="h-2.5 w-2.5 text-primary" />
                ) : (
                  <Share2 className="h-2.5 w-2.5" />
                )}
              </Button>
            </div>
          </article>
        ))}
        {filteredSongs.length === 0 && (
          <div className="py-8 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No trending songs to display
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Connect to a streaming API for real chart data
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
