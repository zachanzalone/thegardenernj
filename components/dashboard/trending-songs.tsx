"use client"

import { useState, useEffect } from "react"
import { Share2, Check, ArrowUp, ArrowDown, Minus, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TrendingSong {
  id: string
  rank: number
  title: string
  artist: string
  plays_display: string
  movement: "up" | "down" | "stable"
  artist_origin: string
}

export function TrendingSongs() {
  const [songs, setSongs] = useState<TrendingSong[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!sbUrl || !sbKey) { setLoading(false); return }

    fetch(`${sbUrl}/rest/v1/trending_songs?active=eq.true&order=rank.asc`, {
      headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` },
    })
      .then((r) => r.json())
      .then((data) => { setSongs(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const shareSong = async (song: TrendingSong) => {
    const shareText = `#${song.rank} "${song.title}" by ${song.artist} (${song.artist_origin}, NJ) - ${song.plays_display}`
    if (navigator.share) {
      try {
        await navigator.share({ title: `${song.title} by ${song.artist}`, text: shareText })
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
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

  const MovementIcon = ({ movement }: { movement: string }) => {
    if (movement === "up") return <span className="flex items-center gap-0.5 text-xs text-primary font-medium"><ArrowUp className="h-3 w-3" /></span>
    if (movement === "down") return <span className="flex items-center gap-0.5 text-xs text-destructive"><ArrowDown className="h-3 w-3" /></span>
    return <Minus className="h-3 w-3 text-muted-foreground" />
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground italic">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-1">
        {songs.map((song) => (
          <article key={song.id} className="group flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center text-sm font-bold text-muted-foreground">
              {song.rank}.
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-medium text-foreground">{song.title}</h4>
              <div className="flex items-center gap-2">
                <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                {song.artist_origin && (
                  <Badge variant="secondary" className="text-[8px] font-normal px-1 py-0">{song.artist_origin}</Badge>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {song.plays_display && <span className="text-xs text-muted-foreground">{song.plays_display}</span>}
              <MovementIcon movement={song.movement} />
              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" onClick={() => shareSong(song)}>
                {copiedId === song.id ? <Check className="h-2.5 w-2.5 text-primary" /> : <Share2 className="h-2.5 w-2.5" />}
              </Button>
            </div>
          </article>
        ))}
        {songs.length === 0 && (
          <div className="py-8 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No trending songs yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Add songs via the admin dashboard</p>
          </div>
        )}
      </div>
    </div>
  )
}
