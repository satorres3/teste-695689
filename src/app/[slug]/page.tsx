import { Metadata } from 'next'
import { ContentLibrary } from '../../../lib/content'
import ContentRenderer from '../../components/ContentRenderer'
import { notFound } from 'next/navigation'
import type { Page, ContentSection } from '../../../types/content'

const DOMAIN = (process.env.WEBSITE_DOMAIN || 'staging.howtomecm.com').trim()

// Helper function to convert page content to sections format
function getPageSections(page: Page): Array<{id: string, type: string, content: any}> {
  // Priority 1: Check if sections array exists
  if (page.sections && Array.isArray(page.sections)) {
    return page.sections
  }

  // Priority 2: Check if content is already an array of sections
  if (page.content && Array.isArray(page.content)) {
    return page.content
  }

  // Priority 3: Handle legacy string content
  if (page.content && typeof page.content === 'string') {
    return [{
      id: 'legacy-content',
      type: 'text',
      content: { text: page.content }
    }]
  }

  return []
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static pages at build time
export async function generateStaticParams() {
  console.log('[BUILD] generateStaticParams - Domain:', DOMAIN)
  console.log('[BUILD] Environment check:', {
    WEBSITE_DOMAIN: process.env.WEBSITE_DOMAIN,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
    HAS_SUPABASE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  const pagesResult = await ContentLibrary.getAllPages(DOMAIN)
  console.log('[BUILD] Pages fetch result:', {
    success: pagesResult.success,
    error: pagesResult.error,
    pageCount: pagesResult.data?.length || 0
  })

  const pages = pagesResult.success ? pagesResult.data || [] : []

  if (pages.length > 0) {
    console.log('[BUILD] Found pages:', pages.map(p => ({ slug: p.slug, title: p.title })))
  }

  const staticParams = pages
    .filter(page => page.slug !== 'home') // Exclude home page
    .map(page => ({
      slug: page.slug,
    }))

  console.log('[BUILD] Generated static params:', staticParams)
  return staticParams
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const pageResult = await ContentLibrary.getPageBySlug(DOMAIN, resolvedParams.slug)
  const page = pageResult.success ? pageResult.data : null

  if (!page) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    }
  }

  return {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription || `Learn about ${page.title}`,
    keywords: page.seo?.focusKeyword ? [page.seo.focusKeyword] : undefined,
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params
  const pageResult = await ContentLibrary.getPageBySlug(DOMAIN, resolvedParams.slug)
  const page = pageResult.success ? pageResult.data : null

  if (!page) {
    notFound()
  }

  return (
    <ContentRenderer
      title={page.title}
      sections={getPageSections(page)}
      seo={page.seo}
    />
  )
}