"use client"

import { useState, useRef, useEffect } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Music,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface Track {
  id: string
  title: string
  artist: string
  audio_url: string
  cover_url?: string
  duration_seconds: number
  sort_order: number
}

export function MusicPlayer() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!sbUrl || !sbKey) { setLoading(false); return }

    fetch(`${sbUrl}/rest/v1/music_player_queue?active=eq.true&order=sort_order.asc`, {
      headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` },
    })
      .then((r) => r.json())
      .then((data) => { setTracks(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const currentTrack = tracks[currentTrackIndex]

  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const togglePlay = () => {
    if (!currentTrack) return
    if (isPlaying) {
      if (progressInterval.current) clearInterval(progressInterval.current)
      audioRef.current?.pause()
    } else {
      if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : volume / 100
        audioRef.current.play().catch(() => {})
      }
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) { handleNext(); return 0 }
          return prev + (100 / (currentTrack.duration_seconds || 200))
        })
      }, 1000)
    }
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    if (!tracks.length) return
    setProgress(0)
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)
  }

  const handlePrev = () => {
    if (!tracks.length) return
    setProgress(0)
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
  }

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index)
    setProgress(0)
    if (!isPlaying) togglePlay()
  }

  useEffect(() => {
    return () => { if (progressInterval.current) clearInterval(progressInterval.current) }
  }, [])

  useEffect(() => {
    if (audioRef.current && currentTrack?.audio_url) {
      audioRef.current.src = currentTrack.audio_url
      audioRef.current.volume = isMuted ? 0 : volume / 100
      if (isPlaying) audioRef.current.play().catch(() => {})
    }
  }, [currentTrackIndex, currentTrack])

  if (!mounted) return null
  if (!loading && tracks.length === 0) return null

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300 ease-in-out",
        isExpanded
          ? "bottom-4 right-4 w-80 rounded-lg border border-border bg-card shadow-xl"
          : "bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm"
      )}
    >
      <audio ref={audioRef} />

      {!isExpanded && currentTrack && (
        <div className="flex items-center gap-3 px-4 py-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setIsExpanded(true)}>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10">
              <Music className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{currentTrack.title}</p>
              <p className="truncate text-xs text-muted-foreground">{currentTrack.artist}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <div className="hidden sm:flex items-center gap-2 w-32">
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground w-10">
              {formatTime((progress / 100) * (currentTrack.duration_seconds || 0))}
            </span>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold tracking-tight">NJ Music Player</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsExpanded(false)}>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground italic">Loading...</div>
            ) : tracks.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No songs in queue</div>
            ) : (
              tracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => selectTrack(index)}
                  className={cn("flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted/50", index === currentTrackIndex && "bg-muted")}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center text-xs text-muted-foreground">
                    {index === currentTrackIndex && isPlaying ? (
                      <div className="flex items-end gap-0.5 h-3">
                        <div className="w-0.5 bg-primary animate-pulse h-full" />
                        <div className="w-0.5 bg-primary animate-pulse h-2/3" style={{ animationDelay: "0.2s" }} />
                        <div className="w-0.5 bg-primary animate-pulse h-1/2" style={{ animationDelay: "0.4s" }} />
                      </div>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{track.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(track.duration_seconds)}</span>
                </button>
              ))
            )}
          </div>

          {currentTrack && (
            <div className="border-t border-border p-4">
              <div className="mb-3">
                <p className="text-sm font-medium truncate">{currentTrack.title}</p>
                <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
              <div className="mb-3">
                <Slider value={[progress]} max={100} step={1} className="cursor-pointer" onValueChange={(v) => setProgress(v[0])} />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>{formatTime((progress / 100) * (currentTrack.duration_seconds || 0))}</span>
                  <span>{formatTime(currentTrack.duration_seconds)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    className="w-16"
                    onValueChange={(v) => { setVolume(v[0]); setIsMuted(false) }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button variant="default" size="icon" className="h-9 w-9 rounded-full" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
                <div className="w-20" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
