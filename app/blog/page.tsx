"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { Calendar, ArrowLeft, User, Clock, Tag } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// WordPress REST API types
interface WordPressPost {
  id: number
  date: string
  slug: string
  title: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  content: {
    rendered: string
  }
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string
      alt_text: string
    }>
    author?: Array<{
      name: string
    }>
    "wp:term"?: Array<Array<{
      id: number
      name: string
      slug: string
    }>>
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&hellip;/g, "...").replace(/&nbsp;/g, " ").trim()
}

function PostCardSkeleton() {
  return (
    <div className="border-b border-border pb-6">
      <Skeleton className="aspect-[16/9] w-full mb-4" />
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

function BlogPosts() {
  const [posts, setPosts] = useState<WordPressPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/blog/posts")
        if (!res.ok) {
          throw new Error("Failed to fetch posts")
        }
        const data = await res.json()
        setPosts(data.posts || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts")
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error || posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto max-w-md">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 
            className="font-display text-2xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            No Posts Yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Connect your WordPress site to display articles here.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 text-left text-sm">
            <p className="font-semibold mb-2">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Set the <code className="bg-muted px-1 rounded">WORDPRESS_API_URL</code> environment variable</li>
              <li>Point it to your WordPress REST API endpoint</li>
              <li>Example: <code className="bg-muted px-1 rounded">https://yoursite.com/wp-json/wp/v2</code></li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  // Split posts into featured and regular
  const [featuredPost, ...regularPosts] = posts

  return (
    <>
      {/* Featured Post */}
      {featuredPost && (
        <article className="mb-12 pb-8 border-b-2 border-foreground">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-[16/9] bg-muted rounded overflow-hidden">
              {featuredPost._embedded?.["wp:featuredmedia"]?.[0]?.source_url ? (
                <img 
                  src={featuredPost._embedded["wp:featuredmedia"][0].source_url}
                  alt={featuredPost._embedded["wp:featuredmedia"][0].alt_text || featuredPost.title.rendered}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Calendar className="h-12 w-12 opacity-50" />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="uppercase tracking-widest text-primary font-semibold">Featured</span>
                <span>*</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(featuredPost.date)}
                </span>
              </div>
              <Link href={`/blog/${featuredPost.slug}`}>
                <h2 
                  className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4 hover:text-primary transition-colors"
                  style={{ fontFamily: 'var(--font-display)' }}
                  dangerouslySetInnerHTML={{ __html: featuredPost.title.rendered }}
                />
              </Link>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {stripHtml(featuredPost.excerpt.rendered)}
              </p>
              {featuredPost._embedded?.author?.[0] && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>By {featuredPost._embedded.author[0].name}</span>
                </div>
              )}
            </div>
          </div>
        </article>
      )}

      {/* Post Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {regularPosts.map((post) => (
          <article key={post.id} className="border-b border-border pb-6">
            <Link href={`/blog/${post.slug}`} className="block group">
              <div className="aspect-[16/9] bg-muted rounded overflow-hidden mb-4">
                {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ? (
                  <img 
                    src={post._embedded["wp:featuredmedia"][0].source_url}
                    alt={post._embedded["wp:featuredmedia"][0].alt_text || post.title.rendered}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Calendar className="h-8 w-8 opacity-50" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Clock className="h-3 w-3" />
                {formatDate(post.date)}
                {post._embedded?.["wp:term"]?.[0]?.[0] && (
                  <>
                    <span>*</span>
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {post._embedded["wp:term"][0][0].name}
                    </span>
                  </>
                )}
              </div>
              
              <h3 
                className="font-display text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {stripHtml(post.excerpt.rendered)}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </>
  )
}

export default function BlogPage() {
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }))
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Newspaper Masthead */}
      <header className="border-b-4 border-double border-foreground">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-2 border-b border-border text-xs">
            <span className="tracking-widest uppercase text-muted-foreground">
              Est. 2020
            </span>
            <span className="text-muted-foreground">{currentDate}</span>
            <div className="flex items-center gap-4">
              <span className="tracking-widest uppercase text-muted-foreground">
                NJ Shore Edition
              </span>
              <ThemeToggle />
            </div>
          </div>
          
          {/* Masthead Title */}
          <div className="py-6 text-center">
            <Link href="/">
              <h1 
                className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight hover:text-primary transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                The Gardener
              </h1>
            </Link>
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

      {/* Navigation */}
      <nav className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex items-center justify-between py-3">
            <Link 
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h2 
              className="font-display text-lg font-bold uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Blog
            </h2>
            <div className="w-[120px]" /> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 pb-4 border-b-2 border-foreground">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
              Stories from the Scene
            </p>
            <h2 
              className="font-display text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Latest Articles
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl mx-auto">
              Deep dives, interviews, reviews, and news from New Jersey{"'"}s vibrant music community.
            </p>
          </div>

          <BlogPosts />
        </div>
      </main>

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* Footer */}
      <footer className="border-t-2 border-foreground">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
          <div className="text-center">
            <Link href="/">
              <h3 
                className="font-display text-2xl md:text-3xl tracking-tight mb-2 hover:text-primary transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                The Gardener
              </h3>
            </Link>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
              Covering New Jersey Music Since 2020
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
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
      </footer>
    </div>
  )
}
