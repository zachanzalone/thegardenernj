import { NextResponse } from "next/server"

const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WP_URL

export async function GET() {
  if (!WORDPRESS_API_URL) {
    return NextResponse.json({ posts: [], message: "WordPress API URL not configured" })
  }
  try {
    const res = await fetch(
      `${WORDPRESS_API_URL}/wp-json/wp/v2/posts?_embed&per_page=12&categories=26`,
      { 
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }
      }
    )
    if (!res.ok) {
      console.error("Failed to fetch WordPress posts:", res.status)
      return NextResponse.json({ posts: [], error: "Failed to fetch from WordPress" }, { status: 500 })
    }
    const contentType = res.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.error("WordPress API did not return JSON")
      return NextResponse.json({ posts: [], error: "Invalid response from WordPress" }, { status: 500 })
    }
    const posts = await res.json()
    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching WordPress posts:", error)
    return NextResponse.json({ posts: [], error: "Failed to connect to WordPress" }, { status: 500 })
  }
}
