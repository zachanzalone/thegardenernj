"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PenLine, Send, Check, Loader2, CalendarPlus } from "lucide-react"

type SubmissionType = "artist" | "band" | "venue" | "event" | "promoter" | "other"

interface FormData {
  type: SubmissionType | ""
  name: string
  email: string
  location: string
  website: string
  socialLinks: string
  description: string
  additionalInfo: string
  eventDate: string
  eventTime: string
  eventEndTime: string
  eventVenue: string
  eventPrice: string
  eventTicketLink: string
  eventAgeRestriction: string
}

const emptyForm: FormData = {
  type: "",
  name: "",
  email: "",
  location: "",
  website: "",
  socialLinks: "",
  description: "",
  additionalInfo: "",
  eventDate: "",
  eventTime: "",
  eventEndTime: "",
  eventVenue: "",
  eventPrice: "",
  eventTicketLink: "",
  eventAgeRestriction: "",
}

export function SubmitModal() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData>(emptyForm)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!sbUrl || !sbKey) throw new Error("Supabase not configured")

      const payload = {
        type: formData.type,
        submitter_name: formData.name,
        submitter_email: formData.email,
        status: "pending",
        data: {
          location: formData.location,
          website: formData.website,
          social_links: formData.socialLinks,
          description: formData.description,
          additional_info: formData.additionalInfo,
          ...(formData.type === "event" && {
            event_date: formData.eventDate,
            event_time: formData.eventTime,
            event_end_time: formData.eventEndTime,
            event_venue: formData.eventVenue,
            event_price: formData.eventPrice,
            event_ticket_link: formData.eventTicketLink,
            event_age_restriction: formData.eventAgeRestriction,
          }),
        },
      }

      const res = await fetch(`${sbUrl}/rest/v1/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": sbKey,
          "Authorization": `Bearer ${sbKey}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err)
      }

      setIsSubmitted(true)
      setTimeout(() => {
        setOpen(false)
        setIsSubmitted(false)
        setFormData(emptyForm)
      }, 2000)
    } catch (err) {
      console.error("Submission error:", err)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getPlaceholders = () => {
    switch (formData.type) {
      case "artist":
        return {
          name: "Artist / Stage Name",
          description: "Tell us about your music, genre, and influences...",
          additionalInfo: "Upcoming releases, recent achievements, etc.",
        }
      case "band":
        return {
          name: "Band Name",
          description: "Tell us about your band, members, and sound...",
          additionalInfo: "Upcoming shows, recent releases, etc.",
        }
      case "venue":
        return {
          name: "Venue Name",
          description: "Describe your venue, capacity, and the types of shows you host...",
          additionalInfo: "Booking contact, typical show nights, etc.",
        }
      case "event":
        return {
          name: "Event / Artist Name",
          description: "Tell us about the event - describe the lineup, genre, and what makes it special...",
          additionalInfo: "Any additional performers, special guests, or notes...",
        }
      case "promoter":
        return {
          name: "Promoter / Company Name",
          description: "Tell us about your work, the shows you book, and venues you work with...",
          additionalInfo: "Upcoming shows, artists you represent, etc.",
        }
      case "other":
        return {
          name: "Name",
          description: "Tell us what you do in the NJ music scene and how you'd like to be involved...",
          additionalInfo: "Any relevant links or additional context...",
        }
      default:
        return {
          name: "Name",
          description: "Tell us about yourself...",
          additionalInfo: "Any additional information...",
        }
    }
  }

  const placeholders = getPlaceholders()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
        >
          <PenLine className="h-4 w-4" />
          Submit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Submit to The Gardener
          </DialogTitle>
          <DialogDescription>
            Are you a venue, band, or artist from New Jersey? Submit your project
            to be featured in our coverage of the local music scene.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center mb-4">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Submission Received
            </h3>
            <p className="text-sm text-muted-foreground">
              Thank you for your submission. Our editorial team will review it shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="type">I am submitting as a...</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select submission type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artist">Solo Artist</SelectItem>
                  <SelectItem value="band">Band</SelectItem>
                  <SelectItem value="venue">Venue</SelectItem>
                  <SelectItem value="event">Event / Show</SelectItem>
                  <SelectItem value="promoter">Promoter</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">{placeholders.name}</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder={placeholders.name} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="your@email.com" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (City, NJ)</Label>
                  <Input id="location" value={formData.location} onChange={(e) => handleChange("location", e.target.value)} placeholder="e.g., Asbury Park, NJ" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (optional)</Label>
                  <Input id="website" type="url" value={formData.website} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://yourwebsite.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialLinks">Social Media Links</Label>
                  <Input id="socialLinks" value={formData.socialLinks} onChange={(e) => handleChange("socialLinks", e.target.value)} placeholder="Instagram, Bandcamp, Spotify, etc." />
                </div>

                {formData.type === "event" && (
                  <div className="space-y-4 p-4 border border-border rounded-md bg-muted/30">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <CalendarPlus className="h-4 w-4" />
                      Event Details for Calendar
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventDate">Event Date *</Label>
                      <Input id="eventDate" type="date" value={formData.eventDate} onChange={(e) => handleChange("eventDate", e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="eventTime">Start Time *</Label>
                        <Input id="eventTime" type="time" value={formData.eventTime} onChange={(e) => handleChange("eventTime", e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eventEndTime">End Time (optional)</Label>
                        <Input id="eventEndTime" type="time" value={formData.eventEndTime} onChange={(e) => handleChange("eventEndTime", e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventVenue">Venue *</Label>
                      <Select value={formData.eventVenue} onValueChange={(value) => handleChange("eventVenue", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select venue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stone-pony">Stone Pony</SelectItem>
                          <SelectItem value="wonder-bar">Wonder Bar</SelectItem>
                          <SelectItem value="house-of-independents">House of Independents</SelectItem>
                          <SelectItem value="asbury-lanes">Asbury Lanes</SelectItem>
                          <SelectItem value="count-basie">Count Basie Center</SelectItem>
                          <SelectItem value="starland">Starland Ballroom</SelectItem>
                          <SelectItem value="white-eagle">White Eagle Hall</SelectItem>
                          <SelectItem value="court-tavern">Court Tavern</SelectItem>
                          <SelectItem value="prudential">Prudential Center</SelectItem>
                          <SelectItem value="brighton-bar">Brighton Bar</SelectItem>
                          <SelectItem value="other-venue">Other (specify in description)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="eventPrice">Ticket Price</Label>
                        <Input id="eventPrice" value={formData.eventPrice} onChange={(e) => handleChange("eventPrice", e.target.value)} placeholder="e.g., $15, Free, $10-20" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eventAgeRestriction">Age Restriction</Label>
                        <Select value={formData.eventAgeRestriction} onValueChange={(value) => handleChange("eventAgeRestriction", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-ages">All Ages</SelectItem>
                            <SelectItem value="18+">18+</SelectItem>
                            <SelectItem value="21+">21+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventTicketLink">Ticket Link (optional)</Label>
                      <Input id="eventTicketLink" type="url" value={formData.eventTicketLink} onChange={(e) => handleChange("eventTicketLink", e.target.value)} placeholder="https://tickets.example.com" />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Events are reviewed before appearing on the calendar. We may reach out for additional details.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">About</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} placeholder={placeholders.description} rows={3} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information (optional)</Label>
                  <Textarea id="additionalInfo" value={formData.additionalInfo} onChange={(e) => handleChange("additionalInfo", e.target.value)} placeholder={placeholders.additionalInfo} rows={2} />
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit for Review
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Submissions are reviewed by our editorial team. We&apos;ll reach out
                  if we&apos;d like to feature your project.
                </p>
              </>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
