import { revalidatePath, revalidateTag } from 'next/cache'

export interface RevalidationResult {
  success: boolean
  revalidatedPaths: string[]
  revalidatedTags: string[]
  error?: string
  processingTime: number
}

export class RevalidationManager {
  private startTime: number
  private revalidatedPaths: string[] = []
  private revalidatedTags: string[] = []

  constructor() {
    this.startTime = Date.now()
  }

  // Revalidate a specific path
  revalidatePath(path: string): void {
    try {
      revalidatePath(path)
      this.revalidatedPaths.push(path)
      console.log(`Revalidated path: ${path}`)
    } catch (error) {
      console.error(`Failed to revalidate path ${path}:`, error)
      throw error
    }
  }

  // Revalidate by tag
  revalidateTag(tag: string): void {
    try {
      revalidateTag(tag)
      this.revalidatedTags.push(tag)
      console.log(`Revalidated tag: ${tag}`)
    } catch (error) {
      console.error(`Failed to revalidate tag ${tag}:`, error)
      throw error
    }
  }

  // Revalidate multiple paths
  revalidateMultiplePaths(paths: string[]): void {
    paths.forEach(path => this.revalidatePath(path))
  }

  // Revalidate multiple tags
  revalidateMultipleTags(tags: string[]): void {
    tags.forEach(tag => this.revalidateTag(tag))
  }

  // Smart revalidation for blog posts
  revalidateBlogPost(slug?: string, action: 'create' | 'update' | 'delete' = 'update'): void {
    // Always revalidate blog listing
    this.revalidatePath('/blog')

    // Revalidate specific post if slug provided
    if (slug) {
      this.revalidatePath(`/blog/${slug}`)
    }

    // Revalidate SEO files
    this.revalidatePath('/sitemap.xml')
    this.revalidatePath('/rss.xml')

    // Revalidate blog-related tags
    this.revalidateTag('blog-posts')

    // If it's a delete, we don't need to revalidate the specific post
    if (action === 'delete' && slug) {
      console.log(`Post ${slug} deleted, cache invalidated`)
    }
  }

  // Smart revalidation for pages
  revalidatePage(slug?: string, action: 'create' | 'update' | 'delete' = 'update'): void {
    // Revalidate specific page if slug provided
    if (slug && slug !== 'home') {
      this.revalidatePath(`/${slug}`)
    } else if (slug === 'home') {
      this.revalidatePath('/')
    }

    // Always revalidate sitemap
    this.revalidatePath('/sitemap.xml')

    // Revalidate page-related tags
    this.revalidateTag('pages')

    if (action === 'delete' && slug) {
      console.log(`Page ${slug} deleted, cache invalidated`)
    }
  }

  // Global revalidation for site settings
  revalidateGlobalSettings(): void {
    // Revalidate key pages that depend on site settings
    this.revalidatePath('/')
    this.revalidatePath('/blog')

    // Revalidate tags for components that use settings
    this.revalidateTag('site-settings')
    this.revalidateTag('layout')
    this.revalidateTag('navigation')

    console.log('Global site settings revalidated')
  }

  // Media revalidation
  revalidateMedia(mediaId?: string): void {
    // Revalidate media-related tags
    this.revalidateTag('media')
    this.revalidateTag('images')

    // Could add more specific logic here if needed
    if (mediaId) {
      console.log(`Media ${mediaId} revalidated`)
    }
  }

  // Category/tag revalidation
  revalidateCategories(): void {
    this.revalidatePath('/blog')
    this.revalidateTag('categories')
    this.revalidateTag('blog-posts')
  }

  // Batch revalidation with error handling
  batchRevalidate(operations: Array<{ type: 'path' | 'tag', value: string }>): void {
    const errors: string[] = []

    operations.forEach(op => {
      try {
        if (op.type === 'path') {
          this.revalidatePath(op.value)
        } else {
          this.revalidateTag(op.value)
        }
      } catch (error) {
        errors.push(`Failed to revalidate ${op.type} ${op.value}: ${error}`)
      }
    })

    if (errors.length > 0) {
      throw new Error(errors.join('; '))
    }
  }

  // Get the final result
  getResult(): RevalidationResult {
    return {
      success: true,
      revalidatedPaths: [...this.revalidatedPaths],
      revalidatedTags: [...this.revalidatedTags],
      processingTime: Date.now() - this.startTime
    }
  }

  // Get result with error
  getErrorResult(error: string): RevalidationResult {
    return {
      success: false,
      revalidatedPaths: [...this.revalidatedPaths],
      revalidatedTags: [...this.revalidatedTags],
      error,
      processingTime: Date.now() - this.startTime
    }
  }
}

// Convenience function for common revalidation patterns
export function createRevalidationManager(): RevalidationManager {
  return new RevalidationManager()
}

// Pre-defined revalidation strategies
export const RevalidationStrategies = {
  // Full site rebuild
  fullSite: (manager: RevalidationManager) => {
    manager.revalidatePath('/')
    manager.revalidatePath('/blog')
    manager.revalidatePath('/sitemap.xml')
    manager.revalidatePath('/rss.xml')
    manager.revalidateTag('global')
  },

  // Blog-only rebuild
  blogOnly: (manager: RevalidationManager) => {
    manager.revalidatePath('/blog')
    manager.revalidatePath('/rss.xml')
    manager.revalidateTag('blog-posts')
  },

  // SEO files only
  seoOnly: (manager: RevalidationManager) => {
    manager.revalidatePath('/sitemap.xml')
    manager.revalidatePath('/rss.xml')
    manager.revalidatePath('/robots.txt')
  }
}