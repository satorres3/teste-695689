import { NextResponse } from 'next/server'

const DOMAIN = (process.env.WEBSITE_DOMAIN || 'staging.howtomecm.com').trim()
const BASE_URL = `https://${DOMAIN}`

export async function GET(): Promise<NextResponse> {
  // Different robots.txt for staging vs production
  const isStaging = DOMAIN.includes('staging')

  let robotsContent: string

  if (isStaging) {
    // Staging: Disallow all crawlers
    robotsContent = `User-agent: *
Disallow: /

# This is a staging environment
# The production site is at https://howtomecm.com

Sitemap: ${BASE_URL}/sitemap.xml`
  } else {
    // Production: Allow all crawlers with some restrictions
    robotsContent = `User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

# Crawl delay to be respectful
Crawl-delay: 1

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml`
  }

  return new NextResponse(robotsContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400' // 24 hours
    }
  })
}