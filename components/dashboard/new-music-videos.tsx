"use client"

import { Play } from "lucide-react"

export function NewMusicVideos() {
  return (
    <div className="py-8 text-center">
      <Play className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
      <p className="text-sm text-muted-foreground">No music videos yet</p>
      <p className="text-xs text-muted-foreground/70 mt-1">Send us your music videos!</p>
    </div>
  )
}
