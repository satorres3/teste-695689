import { NextRequest, NextResponse } from 'next/server'
import { ContentLibrary } from '../../../lib/content'
import type { SitemapEntry } from '../../../types/content'

const DOMAIN = (process.env.WEBSITE_DOMAIN || 'staging.howtomecm.com').trim()
const BASE_URL = `https://${DOMAIN}`

export async function GET(): Promise<NextResponse> {
  try {
    // Fetch all published content
    const [pagesResult, postsResult] = await Promise.all([
      ContentLibrary.getAllPages(DOMAIN),
      ContentLibrary.getAllPosts(DOMAIN)
    ])

    const pages = pagesResult.success ? pagesResult.data || [] : []
    const posts = postsResult.success ? postsResult.data || [] : []

    // Create sitemap entries
    const sitemapEntries: SitemapEntry[] = []

    // Add homepage
    sitemapEntries.push({
      url: BASE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0
    })

    // Add blog index page
    if (posts.length > 0) {
      sitemapEntries.push({
        url: `${BASE_URL}/blog`,
        lastModified: posts[0]?.updated_at || posts[0]?.created_at || new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 0.8
      })
    }

    // Add pages
    pages.forEach(page => {
      if (page.slug !== 'home') { // Skip home page as it's already added
        sitemapEntries.push({
          url: `${BASE_URL}/${page.slug}`,
          lastModified: page.updated_at || page.created_at,
          changeFrequency: 'weekly',
          priority: 0.7
        })
      }
    })

    // Add posts
    posts.forEach(post => {
      sitemapEntries.push({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.updated_at || post.created_at,
        changeFrequency: 'monthly',
        priority: 0.6
      })
    })

    // Generate XML sitemap
    const sitemap = generateSitemapXML(sitemapEntries)

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}

function generateSitemapXML(entries: SitemapEntry[]): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(entry => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return xml
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case "'": return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}