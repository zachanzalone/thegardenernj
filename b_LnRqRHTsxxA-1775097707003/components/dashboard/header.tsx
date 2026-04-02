"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DashboardHeader() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [displayDate, setDisplayDate] = useState<string | null>(null)
  const [isHistorical, setIsHistorical] = useState(false)

  useEffect(() => {
    const now = new Date()
    setSelectedDate(now)
    setDisplayDate(
      now.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        year: "numeric",
      })
    )
    setIsHistorical(false)
  }, [])

  const updateDisplayDate = (date: Date) => {
    setDisplayDate(
      date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        year: "numeric",
      })
    )
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    setIsHistorical(compareDate.getTime() < today.getTime())
  }

  const goToPreviousWeek = () => {
    if (!selectedDate) return
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 7)
    setSelectedDate(newDate)
    updateDisplayDate(newDate)
  }

  const goToNextWeek = () => {
    if (!selectedDate) return
    const today = new Date()
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 7)
    if (newDate <= today) {
      setSelectedDate(newDate)
      updateDisplayDate(newDate)
    }
  }

  const goToToday = () => {
    const now = new Date()
    setSelectedDate(now)
    updateDisplayDate(now)
  }

  const goToDate = (weeksAgo: number) => {
    const date = new Date()
    date.setDate(date.getDate() - (weeksAgo * 7))
    setSelectedDate(date)
    updateDisplayDate(date)
  }

  const canGoForward = () => {
    if (!selectedDate) return false
    const today = new Date()
    const nextWeek = new Date(selectedDate)
    nextWeek.setDate(nextWeek.getDate() + 7)
    return nextWeek <= today
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={goToPreviousWeek}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted rounded-md transition-colors">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{displayDate || "..."}</span>
            {isHistorical && (
              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                Archive
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="end">
          <div className="space-y-1">
            <button 
              onClick={goToToday}
              className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
            >
              Today
            </button>
            <div className="h-px bg-border my-2" />
            <p className="text-xs text-muted-foreground px-3 py-1">Archives</p>
            {[1, 2, 4, 8, 12].map((weeks) => (
              <button 
                key={weeks}
                onClick={() => goToDate(weeks)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
              >
                {weeks === 1 ? "Last week" : `${weeks} weeks ago`}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={goToNextWeek}
        disabled={!canGoForward()}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-2" />
      
      <ThemeToggle />
    </div>
  )
}
