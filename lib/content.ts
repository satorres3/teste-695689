import { supabase } from './supabase'
import type { Page, Post, ContentSection, SEOData, MediaFile } from '../types/content'

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const contentCache = new Map<string, { data: any; timestamp: number }>()

// Cache utilities
function getCacheKey(operation: string, params: Record<string, any>): string {
  return `${operation}:${JSON.stringify(params)}`
}

function getFromCache<T>(key: string): T | null {
  const cached = contentCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCache<T>(key: string, data: T): void {
  contentCache.set(key, { data, timestamp: Date.now() })
}

// Error handling utilities
interface ContentResult<T> {
  data: T | null
  error: string | null
  success: boolean
}

function createSuccessResult<T>(data: T): ContentResult<T> {
  return { data, error: null, success: true }
}

function createErrorResult<T>(error: string): ContentResult<T> {
  console.error('Content fetch error:', error)
  return { data: null, error, success: false }
}

/**
 * Enhanced content fetching library with caching and error handling
 */
export class ContentLibrary {
  /**
   * Get all pages for a domain with caching
   */
  static async getAllPages(domain: string): Promise<ContentResult<Page[]>> {
    const cacheKey = getCacheKey('pages', { domain })
    const cached = getFromCache<Page[]>(cacheKey)

    if (cached) {
      return createSuccessResult(cached)
    }

    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('website_domain', domain)
        .eq('status', 'published')
        .eq('is_published_to_domain', true)
        .order('created_at', { ascending: false })

      if (error) {
        return createErrorResult(`Failed to fetch pages: ${error.message}`)
      }

      const pages = data || []
      setCache(cacheKey, pages)

      return createSuccessResult(pages)
    } catch (error) {
      return createErrorResult(`Unexpected error fetching pages: ${error}`)
    }
  }

  /**
   * Get all posts for a domain with caching
   */
  static async getAllPosts(domain: string): Promise<ContentResult<Post[]>> {
    const cacheKey = getCacheKey('posts', { domain })
    const cached = getFromCache<Post[]>(cacheKey)

    if (cached) {
      return createSuccessResult(cached)
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories(*),
          post_tags(tags(*))
        `)
        .eq('website_domain', domain)
        .eq('status', 'published')
        .eq('is_published_to_domain', true)
        .order('created_at', { ascending: false })

      if (error) {
        return createErrorResult(`Failed to fetch posts: ${error.message}`)
      }

      const posts = data || []
      setCache(cacheKey, posts)

      return createSuccessResult(posts)
    } catch (error) {
      return createErrorResult(`Unexpected error fetching posts: ${error}`)
    }
  }

  /**
   * Get a page by slug with caching
   */
  static async getPageBySlug(domain: string, slug: string): Promise<ContentResult<Page>> {
    const cacheKey = getCacheKey('page', { domain, slug })
    const cached = getFromCache<Page>(cacheKey)

    if (cached) {
      return createSuccessResult(cached)
    }

    try {
      // Special handling for 'home' slug - look for homepage
      if (slug === 'home') {
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('website_domain', domain)
          .eq('is_homepage', true)
          .eq('status', 'published')
          .eq('is_published_to_domain', true)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            return createErrorResult('Homepage not found')
          }
          return createErrorResult(`Failed to fetch homepage: ${error.message}`)
        }

        setCache(cacheKey, data)
        return createSuccessResult(data)
      }

      // Regular slug lookup
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('website_domain', domain)
        .eq('slug', slug)
        .eq('status', 'published')
        .eq('is_published_to_domain', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return createErrorResult('Page not found')
        }
        return createErrorResult(`Failed to fetch page: ${error.message}`)
      }

      setCache(cacheKey, data)
      return createSuccessResult(data)
    } catch (error) {
      return createErrorResult(`Unexpected error fetching page: ${error}`)
    }
  }

  /**
   * Get a post by slug with caching
   */
  static async getPostBySlug(domain: string, slug: string): Promise<ContentResult<Post>> {
    const cacheKey = getCacheKey('post', { domain, slug })
    const cached = getFromCache<Post>(cacheKey)

    if (cached) {
      return createSuccessResult(cached)
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories(*),
          post_tags(tags(*))
        `)
        .eq('website_domain', domain)
        .eq('slug', slug)
        .eq('status', 'published')
        .eq('is_published_to_domain', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return createErrorResult('Post not found')
        }
        return createErrorResult(`Failed to fetch post: ${error.message}`)
      }

      setCache(cacheKey, data)
      return createSuccessResult(data)
    } catch (error) {
      return createErrorResult(`Unexpected error fetching post: ${error}`)
    }
  }

  /**
   * Get posts by category
   */
  static async getPostsByCategory(domain: string, categorySlug: string): Promise<ContentResult<Post[]>> {
    const cacheKey = getCacheKey('posts-category', { domain, categorySlug })
    const cached = getFromCache<Post[]>(cacheKey)

    if (cached) {
      return createSuccessResult(cached)
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_profiles(id, full_name, avatar_url),
          categories!inner(*),
          post_tags(tags(*))
        `)
        .eq('website_domain', domain)
        .eq('status', 'published')
        .eq('is_published_to_domain', true)
        .eq('categories.slug', categorySlug)
        .order('created_at', { ascending: false })

      if (error) {
        return createErrorResult(`Failed to fetch posts by category: ${error.message}`)
      }

      const posts = data || []
      setCache(cacheKey, posts)

      return createSuccessResult(posts)
    } catch (error) {
      return createErrorResult(`Unexpected error fetching posts by category: ${error}`)
    }
  }

  /**
   * Get posts by tag
   */
  static async getPostsByTag(domain: string, tagSlug: string): Promise<ContentResult<Post[]>> {
    const cacheKey = getCacheKey('posts-tag', { domain, tagSlug })
    const cached = getFromCache<Post[]>(cacheKey)

    if (cached) {
      return createSuccessResult(cached)
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories(*),
          post_tags!inner(tags!inner(*))
        `)
        .eq('website_domain', domain)
        .eq('status', 'published')
        .eq('is_published_to_domain', true)
        .eq('post_tags.tags.slug', tagSlug)
        .order('created_at', { ascending: false })

      if (error) {
        return createErrorResult(`Failed to fetch posts by tag: ${error.message}`)
      }

      const posts = data || []
      setCache(cacheKey, posts)

      return createSuccessResult(posts)
    } catch (error) {
      return createErrorResult(`Unexpected error fetching posts by tag: ${error}`)
    }
  }

  /**
   * Get recent posts (limited number)
   */
  static async getRecentPosts(domain: string, limit: number = 5): Promise<ContentResult<Post[]>> {
    const cacheKey = getCacheKey('recent-posts', { domain, limit })
    const cached = getFromCache<Post[]>(cacheKey)

    if (cached) {
      return createSuccessResult(cached)
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories(*),
          post_tags(tags(*))
        `)
        .eq('website_domain', domain)
        .eq('status', 'published')
        .eq('is_published_to_domain', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return createErrorResult(`Failed to fetch recent posts: ${error.message}`)
      }

      const posts = data || []
      setCache(cacheKey, posts)

      return createSuccessResult(posts)
    } catch (error) {
      return createErrorResult(`Unexpected error fetching recent posts: ${error}`)
    }
  }

  /**
   * Get site settings for a domain
   */
  static async getSiteSettings(domain: string): Promise<ContentResult<any>> {
    const cacheKey = getCacheKey('settings', { domain })
    const cached = getFromCache<any>(cacheKey)

    if (cached) {
      return createSuccessResult(cached)
    }

    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('domain', domain)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Return default settings if none exist
          const defaultSettings = {
            domain,
            site_name: domain === 'staging.howtomecm.com' ? 'How to MeCM (Staging)' : 'How to MeCM',
            tagline: 'Professional Content Management',
            description: 'Learn how to manage your content effectively'
          }
          setCache(cacheKey, defaultSettings)
          return createSuccessResult(defaultSettings)
        }
        return createErrorResult(`Failed to fetch site settings: ${error.message}`)
      }

      setCache(cacheKey, data)
      return createSuccessResult(data)
    } catch (error) {
      return createErrorResult(`Unexpected error fetching site settings: ${error}`)
    }
  }

  /**
   * Search content across posts and pages
   */
  static async searchContent(domain: string, query: string): Promise<ContentResult<(Post | Page)[]>> {
    if (!query.trim()) {
      return createSuccessResult([])
    }

    try {
      const [postsResult, pagesResult] = await Promise.all([
        supabase
          .from('posts')
          .select(`
            *,
            categories(*),
            post_tags(tags(*))
          `)
          .eq('website_domain', domain)
          .eq('status', 'published')
          .eq('is_published_to_domain', true)
          .ilike('title', `%${query}%`)
          .order('created_at', { ascending: false }),

        supabase
          .from('pages')
          .select('*')
          .eq('website_domain', domain)
          .eq('status', 'published')
          .eq('is_published_to_domain', true)
          .ilike('title', `%${query}%`)
          .order('created_at', { ascending: false })
      ])

      if (postsResult.error || pagesResult.error) {
        return createErrorResult(`Search failed: ${postsResult.error?.message || pagesResult.error?.message}`)
      }

      const results = [
        ...(postsResult.data || []),
        ...(pagesResult.data || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      return createSuccessResult(results)
    } catch (error) {
      return createErrorResult(`Unexpected error during search: ${error}`)
    }
  }

  /**
   * Clear cache for a specific domain or all cache
   */
  static clearCache(domain?: string): void {
    if (domain) {
      // Clear cache entries for specific domain
      const keysToDelete: string[] = []
      contentCache.forEach((_, key) => {
        if (key.includes(domain)) {
          keysToDelete.push(key)
        }
      })
      keysToDelete.forEach(key => contentCache.delete(key))
    } else {
      // Clear all cache
      contentCache.clear()
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: contentCache.size,
      keys: Array.from(contentCache.keys())
    }
  }
}

// Legacy support - re-export old functions for backward compatibility
export const getAllPages = ContentLibrary.getAllPages
export const getAllPosts = ContentLibrary.getAllPosts
export const getPageBySlug = ContentLibrary.getPageBySlug
export const getPostBySlug = ContentLibrary.getPostBySlug