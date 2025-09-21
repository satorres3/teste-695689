import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our content
export interface Page {
  id: string
  title: string
  slug: string
  content?: string
  sections?: any[]
  status: string
  website_domain?: string
  is_published_to_domain?: boolean
  seo?: {
    metaTitle?: string
    metaDescription?: string
    focusKeyword?: string
  }
}

export interface Post {
  id: string
  title: string
  slug: string
  content?: string
  sections?: any[]
  status: string
  website_domain?: string
  is_published_to_domain?: boolean
  date: string
  category?: string
  tags?: string[]
  featuredImage?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    focusKeyword?: string
  }
}

// Get pages for a specific domain
export async function getPages(domain: string): Promise<Page[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('website_domain', domain)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pages:', error)
    return []
  }

  return data || []
}

// Get posts for a specific domain
export async function getPosts(domain: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories(*),
      post_tags(tags(*))
    `)
    .eq('website_domain', domain)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  return data || []
}

// Get a single page by slug
export async function getPageBySlug(domain: string, slug: string): Promise<Page | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('website_domain', domain)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    console.error('Error fetching page:', error)
    return null
  }

  return data
}

// Get a single post by slug
export async function getPostBySlug(domain: string, slug: string): Promise<Post | null> {
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
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    return null
  }

  return data
}