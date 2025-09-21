/**
 * Comprehensive content types for the website generation system
 */

// Base content interfaces
export interface BaseContent {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  website_domain: string
  is_published_to_domain: boolean
  created_at: string
  updated_at: string
  author_id?: string
  author?: UserProfile
}

// User profile interface
export interface UserProfile {
  id: string
  full_name?: string
  avatar_url?: string
  email?: string
}

// SEO metadata interface
export interface SEOData {
  metaTitle?: string
  metaDescription?: string
  focusKeyword?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  canonicalUrl?: string
  noindex?: boolean
  nofollow?: boolean
  structuredData?: Record<string, any>
}

// Content section types
export interface ContentSection {
  id: string
  type: SectionType
  content: any
  order?: number
  settings?: Record<string, any>
}

export type SectionType =
  | 'text'
  | 'hero'
  | 'image'
  | 'gallery'
  | 'video'
  | 'youtube'
  | 'audio'
  | 'cta'
  | 'button'
  | 'form'
  | 'testimonial'
  | 'faq'
  | 'accordion'
  | 'tabs'
  | 'columns'
  | 'spacer'
  | 'divider'
  | 'code'
  | 'embed'
  | 'social'
  | 'map'
  | 'countdown'
  | 'pricing'
  | 'team'
  | 'stats'
  | 'timeline'
  | 'comparison'
  | 'newsletter'
  | 'contact'
  | 'staging-notice'

// Specific section content interfaces
export interface TextSectionContent {
  text: string
  alignment?: 'left' | 'center' | 'right' | 'justify'
  fontSize?: 'small' | 'medium' | 'large' | 'xl'
  textColor?: string
  backgroundColor?: string
}

export interface HeroSectionContent {
  title: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  backgroundImage?: string
  backgroundVideo?: string
  overlay?: boolean
  overlayColor?: string
  overlayOpacity?: number
  alignment?: 'left' | 'center' | 'right'
}

export interface ImageSectionContent {
  url: string
  alt: string
  caption?: string
  width?: number
  height?: number
  alignment?: 'left' | 'center' | 'right'
  linkUrl?: string
  borderRadius?: number
  shadow?: boolean
}

export interface GallerySectionContent {
  images: Array<{
    url: string
    alt: string
    caption?: string
  }>
  layout?: 'grid' | 'carousel' | 'masonry'
  columns?: number
  spacing?: number
}

export interface VideoSectionContent {
  url: string
  poster?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  width?: number
  height?: number
}

export interface YouTubeSectionContent {
  videoId: string
  startTime?: number
  endTime?: number
  autoplay?: boolean
  showControls?: boolean
  showInfo?: boolean
  width?: number
  height?: number
}

export interface CTASectionContent {
  title?: string
  text: string
  buttonText: string
  buttonLink: string
  buttonStyle?: 'primary' | 'secondary' | 'outline'
  backgroundColor?: string
  textColor?: string
  alignment?: 'left' | 'center' | 'right'
}

export interface TestimonialSectionContent {
  text: string
  author: string
  role?: string
  company?: string
  avatarUrl?: string
  rating?: number
  backgroundColor?: string
}

export interface FAQSectionContent {
  title?: string
  items: FAQItem[]
  style?: 'accordion' | 'tabs' | 'grid'
}

export interface FAQItem {
  q: string
  a: string
  expanded?: boolean
}

export interface FormSectionContent {
  formId: string
  title?: string
  description?: string
  fields: FormField[]
  submitText?: string
  successMessage?: string
  errorMessage?: string
}

export interface FormField {
  id: string
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio'
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  validation?: Record<string, any>
}

// Media file interface
export interface MediaFile {
  id: string
  filename: string
  file_type: string
  file_size: number
  url: string
  alt_text?: string
  caption?: string
  website_domain: string
  uploaded_by: string
  uploaded_at: string
  updated_at?: string
}

// Category and tag interfaces
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  website_domain: string
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  website_domain: string
  created_at: string
}

// Page interface
export interface Page extends BaseContent {
  content?: string
  sections?: ContentSection[]
  seo?: SEOData
  template?: string
  parent_id?: string
  menu_order?: number
  is_homepage?: boolean
  is_in_menu?: boolean
  featured_image?: string
}

// Post interface
export interface Post extends BaseContent {
  content?: string
  sections?: ContentSection[]
  seo?: SEOData
  excerpt?: string
  featured_image?: string
  date: string
  category_id?: string
  category?: Category
  tags?: Tag[]
  comments_enabled?: boolean
  is_featured?: boolean
  view_count?: number
  reading_time?: number
}

// Site settings interface
export interface SiteSettings {
  domain: string
  site_name: string
  tagline?: string
  description?: string
  logo_url?: string
  favicon_url?: string
  primary_color?: string
  secondary_color?: string
  font_family?: string
  language?: string
  timezone?: string
  date_format?: string
  time_format?: string
  social_links?: {
    twitter?: string
    facebook?: string
    instagram?: string
    linkedin?: string
    youtube?: string
    github?: string
  }
  seo_settings?: {
    meta_title?: string
    meta_description?: string
    og_image?: string
    twitter_card?: string
    google_site_verification?: string
    bing_site_verification?: string
  }
  analytics?: {
    google_analytics_id?: string
    google_tag_manager_id?: string
    facebook_pixel_id?: string
    hotjar_id?: string
  }
  integrations?: {
    mailchimp_api_key?: string
    sendgrid_api_key?: string
    stripe_public_key?: string
    disqus_shortname?: string
  }
  maintenance_mode?: boolean
  coming_soon_mode?: boolean
  created_at: string
  updated_at: string
}

// Navigation menu interface
export interface MenuItem {
  id: string
  label: string
  url: string
  target?: '_self' | '_blank'
  parent_id?: string
  order: number
  is_active: boolean
  children?: MenuItem[]
}

export interface NavigationMenu {
  id: string
  name: string
  location: string
  items: MenuItem[]
  website_domain: string
}

// Search result interface
export interface SearchResult {
  type: 'page' | 'post'
  id: string
  title: string
  slug: string
  excerpt?: string
  url: string
  relevance: number
  highlighted_content?: string
}

// Pagination interface
export interface Pagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage?: number
  prevPage?: number
}

// Content listing with pagination
export interface ContentListing<T> {
  items: T[]
  pagination: Pagination
  filters?: Record<string, any>
  sort?: {
    field: string
    direction: 'asc' | 'desc'
  }
}

// Sitemap entry interface
export interface SitemapEntry {
  url: string
  lastModified: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

// RSS feed item interface
export interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  guid: string
  author?: string
  category?: string
  enclosure?: {
    url: string
    type: string
    length: number
  }
}

// Analytics data interface
export interface AnalyticsData {
  pageViews: number
  uniqueVisitors: number
  bounceRate: number
  averageSessionDuration: number
  topPages: Array<{
    path: string
    views: number
    title?: string
  }>
  topReferrers: Array<{
    source: string
    visits: number
  }>
  deviceBreakdown: {
    desktop: number
    mobile: number
    tablet: number
  }
  browserBreakdown: Record<string, number>
  countryBreakdown: Record<string, number>
  timeRange: {
    start: string
    end: string
  }
}

// Error types for content fetching
export interface ContentError {
  code: string
  message: string
  details?: any
}

export interface ContentResult<T> {
  data: T | null
  error: ContentError | null
  success: boolean
  cached?: boolean
  timestamp?: string
}

// Cache configuration
export interface CacheConfig {
  enabled: boolean
  duration: number
  maxSize: number
  strategy: 'memory' | 'redis' | 'file'
}

// Build information
export interface BuildInfo {
  id: string
  status: 'pending' | 'building' | 'success' | 'error'
  trigger: string
  startTime: string
  endTime?: string
  duration?: number
  error?: string
  url?: string
  environment: string
}

// Export utility types
export type ContentType = Page | Post
export type SectionContent =
  | TextSectionContent
  | HeroSectionContent
  | ImageSectionContent
  | GallerySectionContent
  | VideoSectionContent
  | YouTubeSectionContent
  | CTASectionContent
  | TestimonialSectionContent
  | FAQSectionContent
  | FormSectionContent