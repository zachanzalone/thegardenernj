"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, MapPin, Music, Disc3, Clock, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CalendarEvent {
  id: string
  title: string
  artist: string
  artistOrigin: string
  date: string
  time?: string
  type: "show" | "release"
  venue?: string
  venueLocation?: string
  venueSlug?: string
  releaseType?: "album" | "ep" | "single"
}

const venueSocials: Record<string, string> = {
  "stone-pony": "https://instagram.com/stoneponyap",
  "wonder-bar": "https://instagram.com/wonderbarap",
  "house-of-independents": "https://instagram.com/hikiap",
  "asbury-lanes": "https://instagram.com/asburylanes",
  "count-basie": "https://instagram.com/countbasiecenter",
  "starland-ballroom": "https://instagram.com/staraboruough",
  "white-eagle-hall": "https://instagram.com/whiteeaglehall",
  "court-tavern": "https://instagram.com/courttavern",
  "prudential-center": "https://instagram.com/prudentialcenter",
  "brighton-bar": "https://instagram.com/brightonbarlb",
}

const calendarEvents: CalendarEvent[] = []

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function getTodayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`
}

export function CalendarView() {
  const todayStr = getTodayStr()
  const todayDate = new Date()

  const [currentDate, setCurrentDate] = useState(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "show" | "release">("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [showTodayView, setShowTodayView] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    const days: (number | null)[] = []
    for (let i = 0; i < startingDay; i++) days.push(null)
    for (let day = 1; day <= daysInMonth; day++) days.push(day)
    return days
  }, [year, month])

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return calendarEvents.filter((event) => {
      if (filter !== "all" && event.type !== filter) return false
      return event.date === dateStr
    })
  }

  const todayEvents = useMemo(() => {
    return calendarEvents.filter((event) => {
      if (filter !== "all" && event.type !== filter) return false
      return event.date === todayStr
    })
  }, [filter, todayStr])

  const todayShows = todayEvents.filter(e => e.type === "show").sort((a, b) => (a.time || "").localeCompare(b.time || ""))
  const todayReleases = todayEvents.filter(e => e.type === "release")

  const selectedEvents = selectedDate
    ? calendarEvents.filter((event) => {
        if (filter !== "all" && event.type !== filter) return false
        return event.date === selectedDate
      })
    : []

  const groupedEvents = useMemo(() => {
    const shows = selectedEvents.filter(e => e.type === "show").sort((a, b) => (a.time || "").localeCompare(b.time || ""))
    const releases = selectedEvents.filter(e => e.type === "release")
    return { shows, releases }
  }, [selectedEvents])

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const formatDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  const handleDateClick = (day: number) => {
    setSelectedDate(formatDateStr(day))
    setShowTodayView(false)
    setModalOpen(true)
  }

  const handleTodayClick = () => {
    setShowTodayView(!showTodayView)
    setCurrentDate(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1))
  }

  const getVenueLink = (venueSlug?: string) => {
    if (!venueSlug) return null
    return venueSocials[venueSlug] || null
  }

  const formattedToday = todayDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })

  return (
    <div className="space-y-6">

      {/* Calendar Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={goToPrevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-display text-lg sm:text-xl font-bold">{MONTHS[month]} {year}</h3>
          <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter + Today */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn("text-xs px-2 py-1 rounded transition-colors", filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            All
          </button>
          <button
            onClick={handleTodayClick}
            className={cn("text-xs px-2 py-1 rounded transition-colors flex items-center gap-1", showTodayView ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground border border-border")}
          >
            Today
          </button>
          <button
            onClick={() => setFilter("show")}
            className={cn("text-xs px-2 py-1 rounded transition-colors flex items-center gap-1", filter === "show" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <Music className="h-3 w-3" /> <span className="hidden sm:inline">Shows</span>
          </button>
          <button
            onClick={() => setFilter("release")}
            className={cn("text-xs px-2 py-1 rounded transition-colors flex items-center gap-1", filter === "release" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <Disc3 className="h-3 w-3" /> <span className="hidden sm:inline">Releases</span>
          </button>
        </div>
      </div>

      {/* TODAY STACKED VIEW */}
      {showTodayView && (
        <div className="border-2 border-primary rounded-sm overflow-hidden">
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80">Today</p>
              <h4 className="font-display text-lg font-bold">{formattedToday}</h4>
            </div>
            <span className="text-sm opacity-80">{todayEvents.length} event{todayEvents.length !== 1 ? "s" : ""}</span>
          </div>

          {todayEvents.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Music className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nothing scheduled for today</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Add shows and releases through the admin dashboard</p>
            </div>
          ) : (
            <div className="divide-y divide-border">

              {todayShows.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Music className="h-4 w-4 text-primary" />
                    <span className="text-xs uppercase tracking-widest font-semibold text-primary">Live Shows</span>
                  </div>
                  <div className="space-y-3">
                    {todayShows.map((event) => {
                      const venueLink = getVenueLink(event.venueSlug)
                      return (
                        <div key={event.id} className="flex items-start gap-4 p-3 bg-muted/40 rounded">
                          {event.time && (
                            <div className="flex items-center gap-1 shrink-0 text-primary">
                              <Clock className="h-3 w-3" />
                              <span className="text-sm font-bold">{event.time}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground">{event.artist}</p>
                            {event.venue && (
                              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {venueLink ? (
                                  <a href={venueLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                    {event.venue} <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : (
                                  <span>{event.venue}</span>
                                )}
                                {event.venueLocation && <span>— {event.venueLocation}</span>}
                              </div>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-[10px] shrink-0">{event.artistOrigin}, NJ</Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {todayReleases.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Disc3 className="h-4 w-4 text-accent-foreground" />
                    <span className="text-xs uppercase tracking-widest font-semibold">New Releases</span>
                  </div>
                  <div className="space-y-3">
                    {todayReleases.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/40 rounded">
                        <div className="p-1.5 bg-accent/20 rounded shrink-0">
                          <Disc3 className="h-4 w-4 text-accent-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground">{event.artist}</p>
                          <p className="text-sm text-muted-foreground italic">{event.title}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge variant="outline" className="text-[10px] uppercase">{event.releaseType}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{event.artistOrigin}, NJ</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="border border-border rounded-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-muted">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1 sm:py-2 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-16 sm:h-24 bg-muted/30 border-b border-r border-border" />
            }

            const events = getEventsForDay(day)
            const dateStr = formatDateStr(day)
            const isToday = dateStr === todayStr

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn("h-16 sm:h-24 p-0.5 sm:p-1 text-left border-b border-r border-border transition-colors hover:bg-muted/50 flex flex-col", isToday && "ring-2 ring-inset ring-primary")}
              >
                <span className={cn("text-xs sm:text-sm font-medium", isToday && "text-primary font-bold")}>{day}</span>
                <div className="flex-1 overflow-hidden space-y-0.5 mt-0.5 sm:mt-1">
                  {events.slice(0, 2).map((event) => (
                    <div key={event.id} className={cn("text-[8px] sm:text-[10px] px-0.5 sm:px-1 py-0.5 rounded truncate", event.type === "show" ? "bg-primary/20 text-primary" : "bg-accent/30 text-accent-foreground")}>
                      <span className="hidden sm:inline">{event.artist}</span>
                      <span className="sm:hidden">{event.type === "show" ? "S" : "R"}</span>
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-[8px] sm:text-[10px] text-muted-foreground px-0.5 sm:px-1">+{events.length - 2}</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="font-display text-2xl sm:text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {selectedDate && new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""} scheduled</p>
          </DialogHeader>

          <div className="py-6 space-y-8">
            {selectedEvents.length === 0 ? (
              <div className="text-center py-12">
                <Music className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg text-muted-foreground">No events scheduled for this date</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Check back later or browse other dates</p>
              </div>
            ) : (
              <>
                {groupedEvents.shows.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                      <Music className="h-5 w-5 text-primary" />
                      <h3 className="font-display text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Live Shows</h3>
                      <Badge variant="secondary" className="ml-auto">{groupedEvents.shows.length} show{groupedEvents.shows.length !== 1 ? "s" : ""}</Badge>
                    </div>
                    <div className="space-y-4">
                      {groupedEvents.shows.map((event) => {
                        const venueLink = getVenueLink(event.venueSlug)
                        return (
                          <article key={event.id} className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:border-primary/50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                              {event.time && (
                                <div className="flex items-center gap-2 sm:flex-col sm:items-center sm:w-20 shrink-0">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span className="text-lg sm:text-xl font-bold text-primary">{event.time}</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg sm:text-xl font-bold text-foreground">{event.artist}</h4>
                                <Badge variant="secondary" className="text-xs font-normal mt-1">{event.artistOrigin}, NJ</Badge>
                                {event.title && event.title !== event.artist && (
                                  <p className="text-sm text-muted-foreground mt-2 italic">{event.title}</p>
                                )}
                                <div className="mt-4 flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                  {venueLink ? (
                                    <a href={venueLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 font-medium">
                                      {event.venue} <ExternalLink className="h-3 w-3" />
                                    </a>
                                  ) : (
                                    <span className="font-medium">{event.venue}</span>
                                  )}
                                  {event.venueLocation && <span className="text-muted-foreground">- {event.venueLocation}</span>}
                                </div>
                              </div>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                )}

                {groupedEvents.releases.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                      <Disc3 className="h-5 w-5 text-accent-foreground" />
                      <h3 className="font-display text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>New Releases</h3>
                      <Badge variant="secondary" className="ml-auto">{groupedEvents.releases.length} release{groupedEvents.releases.length !== 1 ? "s" : ""}</Badge>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {groupedEvents.releases.map((event) => (
                        <article key={event.id} className="bg-card border border-border rounded-lg p-4 hover:border-accent/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-accent/20 rounded">
                              <Disc3 className="h-6 w-6 text-accent-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-foreground">{event.artist}</h4>
                              <p className="text-sm italic text-muted-foreground mt-0.5">{event.title}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-[10px] uppercase">{event.releaseType}</Badge>
                                <Badge variant="secondary" className="text-[10px]">{event.artistOrigin}, NJ</Badge>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-border pt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary/20" /><span>Shows</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-accent/30" /><span>Releases</span></div>
            </div>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 pt-4 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary/20" /><span>Shows</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-accent/30" /><span>Releases</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded ring-2 ring-primary" /><span>Today</span></div>
      </div>
    </div>
  )
}
