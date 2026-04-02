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
  Flame,
  TrendingUp,
  Clock,
  Radio,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Track {
  id: string
  title: string
  artist: string
  artistOrigin: string
  duration: number // in seconds
  plays: string
  playsNum: number
  isNew: boolean
  isTrending: boolean
  previewUrl: string
}

// Established artist tracks
const establishedTracks: Track[] = [
  {
    id: "1",
    title: "Midnight in Asbury",
    artist: "The Gaslight Anthem",
    artistOrigin: "New Brunswick",
    duration: 234,
    plays: "2.4M",
    playsNum: 2400000,
    isNew: false,
    isTrending: true,
    previewUrl: ""
  },
  {
    id: "2",
    title: "Garden State Dreams",
    artist: "The Bouncing Souls",
    artistOrigin: "New Brunswick",
    duration: 198,
    plays: "1.8M",
    playsNum: 1800000,
    isNew: false,
    isTrending: true,
    previewUrl: ""
  },
  {
    id: "3",
    title: "Shore Leave",
    artist: "Titus Andronicus",
    artistOrigin: "Glen Rock",
    duration: 267,
    plays: "1.5M",
    playsNum: 1500000,
    isNew: true,
    isTrending: true,
    previewUrl: ""
  },
  {
    id: "4",
    title: "Coastal Highway",
    artist: "The Vansaders",
    artistOrigin: "Red Bank",
    duration: 212,
    plays: "45K",
    playsNum: 45000,
    isNew: true,
    isTrending: false,
    previewUrl: ""
  },
  {
    id: "5",
    title: "Saltwater Dreams",
    artist: "Molly & The Reveries",
    artistOrigin: "Long Branch",
    duration: 245,
    plays: "32K",
    playsNum: 32000,
    isNew: true,
    isTrending: false,
    previewUrl: ""
  },
  {
    id: "6",
    title: "Jersey Lightning",
    artist: "Real Estate",
    artistOrigin: "Ridgewood",
    duration: 189,
    plays: "980K",
    playsNum: 980000,
    isNew: false,
    isTrending: true,
    previewUrl: ""
  },
  {
    id: "7",
    title: "Exit 100",
    artist: "The Parkway Sound",
    artistOrigin: "Freehold",
    duration: 223,
    plays: "28K",
    playsNum: 28000,
    isNew: true,
    isTrending: false,
    previewUrl: ""
  },
  {
    id: "8",
    title: "Ocean Grove",
    artist: "Pinegrove",
    artistOrigin: "Montclair",
    duration: 256,
    plays: "750K",
    playsNum: 750000,
    isNew: false,
    isTrending: true,
    previewUrl: ""
  },
  {
    id: "9",
    title: "Dorm Room Diaries",
    artist: "Basement Cassette",
    artistOrigin: "New Brunswick",
    duration: 178,
    plays: "89K",
    playsNum: 89000,
    isNew: true,
    isTrending: true,
    previewUrl: ""
  },
  {
    id: "10",
    title: "Full Collapse",
    artist: "Thursday",
    artistOrigin: "New Brunswick",
    duration: 301,
    plays: "480K",
    playsNum: 480000,
    isNew: false,
    isTrending: false,
    previewUrl: ""
  }
]

// Emerging artist tracks for the radio station
const emergingTracks: Track[] = [
  {
    id: "e1",
    title: "Suburban Decay",
    artist: "Dead Mall Kids",
    artistOrigin: "Cherry Hill",
    duration: 198,
    plays: "12K",
    playsNum: 12000,
    isNew: true,
    isTrending: true,
    previewUrl: ""
  },
  {
    id: "e2",
    title: "Exit 82",
    artist: "The Pines",
    artistOrigin: "Toms River",
    duration: 215,
    plays: "8.5K",
    playsNum: 8500,
    isNew: true,
    isTrending: false,
    previewUrl: ""
  },
  {
    id: "e3",
    title: "Transmission",
    artist: "Satellite Hearts",
    artistOrigin: "Princeton",
    duration: 242,
    plays: "23K",
    playsNum: 23000,
    isNew: true,
    isTrending: true,
    previewUrl: ""
  },
  {
    id: "e4",
    title: "Factory Towns",
    artist: "Rust Belt Revival",
    artistOrigin: "Newark",
    duration: 267,
    plays: "15K",
    playsNum: 15000,
    isNew: true,
    isTrending: true,
    previewUrl: ""
  },
  {
    id: "e5",
    title: "Post-Punk Paradise",
    artist: "Broken Parlor",
    artistOrigin: "Morristown",
    duration: 189,
    plays: "6.2K",
    playsNum: 6200,
    isNew: true,
    isTrending: false,
    previewUrl: ""
  },
  {
    id: "e6",
    title: "Boardwalk Nights",
    artist: "Summer Saints",
    artistOrigin: "Point Pleasant",
    duration: 203,
    plays: "31K",
    playsNum: 31000,
    isNew: true,
    isTrending: true,
    previewUrl: ""
  },
  {
    id: "e7",
    title: "Transit",
    artist: "The Commuters",
    artistOrigin: "Hoboken",
    duration: 178,
    plays: "9.8K",
    playsNum: 9800,
    isNew: true,
    isTrending: false,
    previewUrl: ""
  },
  {
    id: "e8",
    title: "Retro Soul",
    artist: "Vinyl Hearts",
    artistOrigin: "Montclair",
    duration: 234,
    plays: "18K",
    playsNum: 18000,
    isNew: true,
    isTrending: true,
    previewUrl: ""
  }
]

type SortMode = "new" | "trending" | "top" | "emerging"

export function MusicPlayer() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>("trending")
  const [mounted, setMounted] = useState(false)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sortedTracks = sortMode === "emerging" 
    ? [...emergingTracks].sort((a, b) => b.playsNum - a.playsNum)
    : [...establishedTracks].sort((a, b) => {
        switch (sortMode) {
          case "new":
            return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
          case "trending":
            return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0)
          case "top":
            return b.playsNum - a.playsNum
          default:
            return 0
        }
      })

  const currentTrack = sortedTracks[currentTrackIndex]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const togglePlay = () => {
    if (isPlaying) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    } else {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext()
            return 0
          }
          return prev + (100 / currentTrack.duration)
        })
      }, 1000)
    }
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    setProgress(0)
    setCurrentTrackIndex((prev) => (prev + 1) % sortedTracks.length)
  }

  const handlePrev = () => {
    setProgress(0)
    setCurrentTrackIndex((prev) => (prev - 1 + sortedTracks.length) % sortedTracks.length)
  }

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index)
    setProgress(0)
    if (!isPlaying) {
      togglePlay()
    }
  }

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [])

  if (!mounted) return null

  return (
    <div 
      className={cn(
        "fixed z-50 transition-all duration-300 ease-in-out",
        isExpanded 
          ? "bottom-4 right-4 w-80 rounded-lg border border-border bg-card shadow-xl"
          : "bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm"
      )}
    >
      {/* Collapsed Bar View */}
      {!isExpanded && (
        <div className="flex items-center gap-3 px-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setIsExpanded(true)}
          >
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
              <div 
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-10">
              {formatTime((progress / 100) * currentTrack.duration)}
            </span>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              {sortMode === "emerging" ? (
                <>
                  <Radio className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold tracking-tight">Emerging Radio</span>
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                </>
              ) : (
                <>
                  <Music className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold tracking-tight">NJ Music Player</span>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort Filter */}
          <div className="border-b border-border px-4 py-2">
            <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  <span className="flex items-center gap-2">
                    <Clock className="h-3 w-3" /> New This Week
                  </span>
                </SelectItem>
                <SelectItem value="trending">
                  <span className="flex items-center gap-2">
                    <Flame className="h-3 w-3" /> Trending
                  </span>
                </SelectItem>
                <SelectItem value="top">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" /> Most Streams
                  </span>
                </SelectItem>
                <SelectItem value="emerging">
                  <span className="flex items-center gap-2">
                    <Radio className="h-3 w-3" /> Emerging Radio
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Track List */}
          <div className="max-h-48 overflow-y-auto">
            {sortedTracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => selectTrack(index)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted/50",
                  index === currentTrackIndex && "bg-muted"
                )}
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
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium">{track.title}</p>
                    {track.isNew && (
                      <Badge variant="secondary" className="text-[8px] px-1 py-0 bg-primary/20 text-primary">
                        NEW
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                    <span className="text-[9px] text-muted-foreground">({track.artistOrigin})</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{track.plays}</span>
              </button>
            ))}
          </div>

          {/* Now Playing */}
          <div className="border-t border-border p-4">
            <div className="mb-3">
              <p className="text-sm font-medium truncate">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.artist} - {currentTrack.artistOrigin}, NJ
              </p>
            </div>

            {/* Progress */}
            <div className="mb-3">
              <Slider
                value={[progress]}
                max={100}
                step={1}
                className="cursor-pointer"
                onValueChange={(v) => setProgress(v[0])}
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>{formatTime((progress / 100) * currentTrack.duration)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  className="w-16"
                  onValueChange={(v) => {
                    setVolume(v[0])
                    setIsMuted(false)
                  }}
                />
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button 
                  variant="default" 
                  size="icon" 
                  className="h-9 w-9 rounded-full"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-20" /> {/* Spacer for centering */}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
