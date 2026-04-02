"use client"

import { useState } from "react"
import { Calendar, MapPin, Ticket, Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Format date without timezone issues - parse as local date
function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[month - 1]} ${day}`
}

interface Show {
  id: string
  artist: string
  venue: string
  date: string
  time: string
  ticketLink: string
  venueLocation: string
  artistOrigin: string
}

// Empty array - real show data would be fetched from an API
const mockShows: Show[] = []

export function UpcomingShows() {
  const [shows] = useState<Show[]>(mockShows)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"date" | "artist">("date")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const shareShow = async (show: Show) => {
    const shareText = `${show.artist} live at ${show.venue}, ${show.venueLocation} - ${formatDate(show.date)} at ${show.time}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${show.artist} at ${show.venue}`,
          text: shareText,
          url: show.ticketLink
        })
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(`${shareText}\nTickets: ${show.ticketLink}`)
          setCopiedId(show.id)
          setTimeout(() => setCopiedId(null), 2000)
        }
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\nTickets: ${show.ticketLink}`)
      setCopiedId(show.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const filteredShows = shows
    .filter(show => 
      show.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.venue.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(show => locationFilter === "all" || show.venueLocation.toLowerCase().includes(locationFilter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      return a.artist.localeCompare(b.artist)
    })

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6">
        <Input
          placeholder="Search artists or venues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 text-sm"
        />
        <div className="flex gap-2">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="h-9 flex-1 text-sm">
              <SelectValue placeholder="Venue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Venues</SelectItem>
              <SelectItem value="stone pony">Stone Pony</SelectItem>
              <SelectItem value="wonder bar">Wonder Bar</SelectItem>
              <SelectItem value="house of independents">House of Independents</SelectItem>
              <SelectItem value="asbury lanes">Asbury Lanes</SelectItem>
              <SelectItem value="count basie">Count Basie Center</SelectItem>
              <SelectItem value="starland">Starland Ballroom</SelectItem>
              <SelectItem value="white eagle">White Eagle Hall</SelectItem>
              <SelectItem value="court tavern">Court Tavern</SelectItem>
              <SelectItem value="prudential">Prudential Center</SelectItem>
              <SelectItem value="brighton bar">Brighton Bar</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "artist")}>
            <SelectTrigger className="h-9 w-[100px] text-sm">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">By Date</SelectItem>
              <SelectItem value="artist">By Artist</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-3">
        {filteredShows.map((show) => (
          <article
            key={show.id}
            className="group border-b border-border pb-3 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-foreground">{show.artist}</h4>
                  <Badge variant="secondary" className="text-[9px] font-normal px-1.5 py-0">
                    {show.artistOrigin}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {show.venue}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(show.date)} at {show.time}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => shareShow(show)}
                >
                  {copiedId === show.id ? (
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
                  <a href={show.ticketLink} target="_blank" rel="noopener noreferrer">
                    <Ticket className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </article>
        ))}
        {filteredShows.length === 0 && (
          <div className="py-8 text-center">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No upcoming shows to display
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Connect to a data source to see real show listings
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
