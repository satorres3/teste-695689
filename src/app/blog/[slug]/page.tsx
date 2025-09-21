import { Metadata } from 'next'
import { ContentLibrary } from '../../../../lib/content'
import ContentRenderer from '../../../components/ContentRenderer'
import SocialShare from '../../../components/SocialShare'
import { notFound } from 'next/navigation'
import type { Post } from '../../../../types/content'

const DOMAIN = (process.env.WEBSITE_DOMAIN || 'staging.howtomecm.com').trim()

interface BlogPostProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static pages at build time
export async function generateStaticParams() {
  const postsResult = await ContentLibrary.getAllPosts(DOMAIN)
  const posts = postsResult.success ? postsResult.data || [] : []

  return posts.map(post => ({
    slug: post.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const resolvedParams = await params
  const postResult = await ContentLibrary.getPostBySlug(DOMAIN, resolvedParams.slug)
  const post = postResult.success ? postResult.data : null

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    }
  }

  const postUrl = `https://${DOMAIN}/blog/${post.slug}`
  const imageUrl = post.featured_image || `https://${DOMAIN}/og-image.jpg`

  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt || `Read about ${post.title}`,
    keywords: post.seo?.focusKeyword ? [post.seo.focusKeyword] : post.tags?.map(tag => typeof tag === 'string' ? tag : tag.name),
    authors: post.author?.full_name ? [{ name: post.author.full_name }] : undefined,
    openGraph: {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt || `Read about ${post.title}`,
      type: 'article',
      url: postUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.date || post.created_at,
      modifiedTime: post.updated_at,
      authors: post.author?.full_name ? [post.author.full_name] : undefined,
      tags: post.tags?.map(tag => typeof tag === 'string' ? tag : tag.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt || `Read about ${post.title}`,
      images: [imageUrl],
    },
    alternates: {
      canonical: postUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function BlogPost({ params }: BlogPostProps) {
  const resolvedParams = await params
  const postResult = await ContentLibrary.getPostBySlug(DOMAIN, resolvedParams.slug)
  const post = postResult.success ? postResult.data : null

  if (!post) {
    notFound()
  }

  // Get related posts (same category or tags)
  const allPostsResult = await ContentLibrary.getAllPosts(DOMAIN)
  const allPosts = allPostsResult.success ? allPostsResult.data || [] : []

  const relatedPosts = allPosts
    .filter(p => p.id !== post.id)
    .filter(p =>
      (post.category?.name && p.category?.name === post.category.name) ||
      (post.tags && post.tags.some(tag => p.tags?.includes(tag)))
    )
    .slice(0, 3)

  const postUrl = `https://${DOMAIN}/blog/${post.slug}`
  const shareText = encodeURIComponent(post.title)

  return (
    <article className="min-h-screen">
      {/* Blog post header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <nav className="mb-4">
            <a href="/blog" className="text-blue-600 hover:text-blue-800">
              ← Back to Blog
            </a>
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
            <span>{new Date(post.date || post.created_at).toLocaleDateString()}</span>
            {post.author?.full_name && (
              <span>by {post.author.full_name}</span>
            )}
            {post.category?.name && (
              <a
                href={`/blog?category=${encodeURIComponent(post.category.name)}`}
                className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-200"
              >
                {post.category.name}
              </a>
            )}
          </div>

          {/* Social sharing */}
          <SocialShare title={post.title} url={postUrl} />
        </div>
      </header>

      {/* Featured image */}
      {post.featured_image && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content sections */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {post.sections && post.sections.length > 0 ? (
            post.sections.map((section: any, index: number) => (
              <ContentRenderer
                key={section.id || index}
                title=""
                sections={[section]}
                seo={post.seo}
              />
            ))
          ) : (
            <div className="prose prose-lg max-w-none">
              {post.content ? (
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              ) : (
                <p className="text-gray-600">No content available for this post.</p>
              )}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index: number) => {
                  const tagName = typeof tag === 'string' ? tag : tag.name
                  return (
                  <a
                    key={index}
                    href={`/blog?tag=${encodeURIComponent(tagName)}`}
                    className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    #{tagName}
                  </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Author info */}
          {post.author && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-center space-x-4">
                {post.author.avatar_url && (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.full_name}
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">{post.author.full_name}</h4>
                </div>
              </div>
            </div>
          )}

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {relatedPost.featured_image && (
                      <img
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h4 className="font-semibold mb-2 text-gray-900">
                        <a href={`/blog/${relatedPost.slug}`} className="hover:text-blue-600">
                          {relatedPost.title}
                        </a>
                      </h4>
                      <p className="text-gray-600 text-xs mb-2">
                        {new Date(relatedPost.date || relatedPost.created_at).toLocaleDateString()}
                      </p>
                      {relatedPost.category?.name && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {relatedPost.category.name}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Navigation to previous/next posts */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex justify-between">
              <a
                href="/blog"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← All Posts
              </a>
              <a
                href="#top"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Back to Top ↑
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}