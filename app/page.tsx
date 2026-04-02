
"use client"

import { useState, useEffect } from "react"
import { UpcomingShows } from "@/components/dashboard/upcoming-shows"
import { UpcomingReleases } from "@/components/dashboard/upcoming-releases"
import { TrendingSongs } from "@/components/dashboard/trending-songs"
import { NewMusicVideos } from "@/components/dashboard/new-music-videos"
import { EmergingArtists } from "@/components/dashboard/emerging-artists"
import { CalendarView } from "@/components/dashboard/calendar-view"
import { MusicPlayer } from "@/components/dashboard/music-player"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { SubmitModal } from "@/components/submit-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { Calendar, FileText, TrendingUp, Users, X, Bell } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Section = "established" | "emerging" | "calendar"

type WPPost = {
  id: number
  title: { rendered: string }
  excerpt: { rendered: string }
  link: string
  date: string
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string }>
  }
}

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<Section>("established")
  const [showBanner, setShowBanner] = useState(true)
  const [currentDate, setCurrentDate] = useState("")
  const [featuredPost, setFeaturedPost] = useState<WPPost | null>(null)
  const [latestPosts, setLatestPosts] = useState<WPPost[]>([])
  const [blogEnabled, setBlogEnabled] = useState(false)

  useEffect(() => {
    fetch("/api/blog/posts")
      .then(r => r.json())
      .then(data => {
        if (data.posts?.length) {
          setFeaturedPost(data.posts[0])
          setLatestPosts(data.posts.slice(1, 4))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!sbUrl || !sbKey) return
    fetch(`${sbUrl}/rest/v1/site_settings?key=eq.blog_enabled&select=value`, {
      headers: {
        apikey: sbKey,
        Authorization: `Bearer ${sbKey}`,
      },
    })
      .then(r => r.json())
      .then(data => {
        if (data?.[0]) {
          setBlogEnabled(data[0].value === true || data[0].value === "true")
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    )
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">

      {showBanner && (
        <div className="bg-primary text-primary-foreground py-2 px-3 sm:px-4">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Bell className="h-4 w-4 shrink-0 hidden sm:block" />
              <p className="text-xs sm:text-sm truncate sm:whitespace-normal">
                <span className="font-semibold">New?</span>
                <span className="hidden sm:inline"> Subscribe to get weekly updates on NJ shows and releases.</span>
                <span className="sm:hidden"> Get weekly NJ music updates.</span>
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button
                size="sm"
                variant="secondary"
                className="text-xs h-6 sm:h-7 px-2 sm:px-3"
                onClick={() => {
                  const newsletter = document.getElementById("newsletter-signup")
                  newsletter?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Subscribe
              </Button>
              <button
                onClick={() => setShowBanner(false)}
                className="p-1 hover:bg-primary-foreground/10 rounded"
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b-4 border-double border-foreground">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex items-center justify-between py-2 border-b border-border text-xs">
            <span className="tracking-widest uppercase text-muted-foreground">Est. 2020</span>
            <span className="text-muted-foreground">{currentDate}</span>
            <div className="flex items-center gap-4">
              <span className="tracking-widest uppercase text-muted-foreground hidden sm:inline">NJ Shore Edition</span>
              <SubmitModal />
              <ThemeToggle />
            </div>
          </div>
          <div className="py-6 text-center">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              The Gardener
            </h1>
            <div className="mt-2 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>Asbury Park</span>
              <span className="text-primary">*</span>
              <span>New Brunswick</span>
              <span className="text-primary">*</span>
              <span>Hoboken</span>
              <span className="text-primary">*</span>
              <span>Jersey City</span>
            </div>
          </div>
        </div>
      </header>

      {blogEnabled && (
        <section className="border-b-2 border-foreground">
          <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 border-r-0 md:border-r border-border md:pr-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold">Featured</span>
                </div>
                {featuredPost ? (
                  <a href={featuredPost.link} target="_blank" rel="noopener noreferrer" className="group">
                    <h2
                      className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 group-hover:underline"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {featuredPost.title.rendered.replace(/<[^>]+>/g, "")}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {featuredPost.excerpt.rendered.replace(/<[^>]+>/g, "")}
                    </p>
                    {featuredPost._embedded?.["wp:featuredmedia"]?.[0]?.source_url ? (
                      <img
                        src={featuredPost._embedded["wp:featuredmedia"][0].source_url}
                        alt={featuredPost.title.rendered.replace(/<[^>]+>/g, "")}
                        className="w-full aspect-video object-cover rounded"
                      />
                    ) : (
                      <div className="aspect-video bg-muted rounded flex items-center justify-center">
                        <FileText className="h-12 w-12 opacity-50" />
                      </div>
                    )}
                  </a>
                ) : (
                  <div>
                    <h2
                      className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      NJ Music Scene Continues to Thrive
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      From basement shows in New Brunswick to sold-out nights at the Stone Pony, the Garden State&apos;s music community remains one of the most vibrant in the country.
                    </p>
                    <div className="aspect-video bg-muted rounded flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No posts in NJ category yet</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {latestPosts.length > 0 ? (
                  latestPosts.map(post => (
                    <div key={post.id} className="pb-6 border-b border-border last:border-0">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">Latest</span>
                      
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline font-display text-xl font-bold mt-2 leading-tight block"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {post.title.rendered.replace(/<[^>]+>/g, "")}
                      </a>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {post.excerpt.rendered.replace(/<[^>]+>/g, "")}
                      </p>
                    </div>
                  ))
                ) : (
                  <div>
                    <div className="pb-6 border-b border-border">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">Latest</span>
                      <p className="font-display text-xl font-bold mt-2 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                        Local Venues Report Record Attendance
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">Asbury Park venues see surge in concert-goers as summer approaches.</p>
                    </div>
                    <div className="pb-6 border-b border-border">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">Profile</span>
                      <p className="font-display text-xl font-bold mt-2 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                        Rising Stars: The Next Generation
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">Meet the emerging artists shaping NJ&apos;s sound.</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">Opinion</span>
                      <p className="font-display text-xl font-bold mt-2 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                        Why the Shore Sound Endures
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">A reflection on decades of musical heritage.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <nav className="border-b border-border sticky top-0 z-40 bg-background">
        <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-8 py-2 sm:py-3 overflow-x-auto">
            <button
              onClick={() => setActiveSection("established")}
              className={cn(
                "flex items-center gap-1 sm:gap-2 text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest transition-colors whitespace-nowrap",
                activeSection === "established"
                  ? "text-foreground font-semibold border-b-2 border-primary pb-1"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Shows & Releases</span>
              <span className="sm:hidden">Shows</span>
            </button>
            <span className="text-border hidden sm:inline">|</span>
            <button
              onClick={() => setActiveSection("emerging")}
              className={cn(
                "flex items-center gap-1 sm:gap-2 text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest transition-colors whitespace-nowrap",
                activeSection === "emerging"
                  ? "text-foreground font-semibold border-b-2 border-primary pb-1"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Rising Artists</span>
              <span className="sm:hidden">Artists</span>
            </button>
            <span className="text-border hidden sm:inline">|</span>
            <button
              onClick={() => setActiveSection("calendar")}
              className={cn(
                "flex items-center gap-1 sm:gap-2 text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest transition-colors whitespace-nowrap",
                activeSection === "calendar"
                  ? "text-foreground font-semibold border-b-2 border-primary pb-1"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              Calendar
            </button>
            {blogEnabled && (
              <>
                <span className="text-border hidden sm:inline">|</span>
                <Link
                  href="/blog"
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest transition-colors text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  Blog
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {activeSection === "established" && (
            <div>
              <div className="text-center mb-8 pb-4 border-b-2 border-foreground">
                <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">This Week in New Jersey</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                  Shows, Releases & What&apos;s Trending
                </h2>
              </div>
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                  <div className="border-t-2 border-foreground pt-4">
                    <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight mb-4 pb-2 border-b border-border" style={{ fontFamily: "var(--font-display)" }}>
                      Upcoming Shows
                    </h3>
                    <UpcomingShows />
                  </div>
                </div>
                <div className="lg:col-span-4 space-y-8">
                  <div className="border-t-2 border-foreground pt-4">
                    <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight mb-4 pb-2 border-b border-border" style={{ fontFamily: "var(--font-display)" }}>
                      Trending This Week
                    </h3>
                    <TrendingSongs />
                  </div>
                  <div className="border-t border-border pt-4">
                    <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight mb-4 pb-2 border-b border-border" style={{ fontFamily: "var(--font-display)" }}>
                      New Music Videos
                    </h3>
                    <NewMusicVideos />
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <div className="border-t-2 border-foreground pt-4">
                    <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight mb-4 pb-2 border-b border-border" style={{ fontFamily: "var(--font-display)" }}>
                      New Releases
                    </h3>
                    <UpcomingReleases />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "emerging" && (
            <div>
              <div className="text-center mb-8 pb-4 border-b-2 border-foreground">
                <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Discover the Next Wave</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                  Rising Talent from the Garden State
                </h2>
                <p className="mt-3 text-sm text-muted-foreground max-w-2xl mx-auto">
                  Small to mid-sized artists building momentum across New Jersey&apos;s vibrant local scene. From basement shows to opening slots, these are the acts to watch.
                </p>
              </div>
              <EmergingArtists />
            </div>
          )}

          {activeSection === "calendar" && (
            <div>
              <div className="text-center mb-8 pb-4 border-b-2 border-foreground">
                <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Plan Your Month</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                  NJ Music Calendar
                </h2>
                <p className="mt-3 text-sm text-muted-foreground max-w-2xl mx-auto">
                  All shows and releases from the Garden State in one place. Click any date to see what&apos;s happening.
                </p>
              </div>
              <CalendarView />
            </div>
          )}
        </div>
      </main>

      <NewsletterSignup />

      <footer className="border-t-2 border-foreground">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
          <div className="text-center">
            <h3 className="font-display text-2xl md:text-3xl tracking-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
              The Gardener
            </h3>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Covering New Jersey Music Since 2020</p>
            <div className="flex items-center justify-center gap-6 mb-6">
              <a href="https://www.tiktok.com/@thegardenernj" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="TikTok">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@thegardenernj" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="YouTube">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/thegardenernj" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <a href="https://discord.gg/9XM2pxgfVr" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Discord">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs text-muted-foreground flex-wrap">
              <span>Asbury Park</span>
              <span className="text-primary">*</span>
              <span>New Brunswick</span>
              <span className="text-primary">*</span>
              <span>Hoboken</span>
              <span className="text-primary">*</span>
              <span>Jersey City</span>
            </div>
            <p className="mt-6 text-xs text-muted-foreground/60">
              Connect a data source to populate this dashboard with real show dates, releases, and events.
            </p>
          </div>
        </div>
      </footer>

      <MusicPlayer />
    </div>
  )
}
```
