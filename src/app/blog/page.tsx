import { Metadata } from 'next'
import { ContentLibrary } from '../../../lib/content'
import type { Post } from '../../../types/content'

const DOMAIN = (process.env.WEBSITE_DOMAIN || 'staging.howtomecm.com').trim()

interface BlogPageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    tag?: string
  }>
}

// Generate metadata with dynamic content
export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams
  const postsResult = await ContentLibrary.getAllPosts(DOMAIN)
  const posts = postsResult.success ? postsResult.data || [] : []

  let title = 'Blog - How to MeCM'
  let description = 'Latest articles and insights about content management'

  if (resolvedParams.category) {
    title = `${resolvedParams.category} Articles - How to MeCM`
    description = `Latest articles in the ${resolvedParams.category} category`
  } else if (resolvedParams.tag) {
    title = `${resolvedParams.tag} Posts - How to MeCM`
    description = `Posts tagged with ${resolvedParams.tag}`
  } else if (resolvedParams.page) {
    title = `Blog - Page ${resolvedParams.page} - How to MeCM`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${DOMAIN}/blog`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedParams = await searchParams
  const page = parseInt(resolvedParams.page || '1', 10)
  const postsPerPage = 6
  const category = resolvedParams.category
  const tag = resolvedParams.tag

  const postsResult = await ContentLibrary.getAllPosts(DOMAIN)
  let posts = postsResult.success ? postsResult.data || [] : []

  // Filter by category if specified
  if (category) {
    posts = posts.filter(post =>
      post.category?.name?.toLowerCase() === category.toLowerCase()
    )
  }

  // Filter by tag if specified
  if (tag) {
    posts = posts.filter(post =>
      post.tags?.some(postTag => {
        const tagName = typeof postTag === 'string' ? postTag : postTag.name
        return tagName.toLowerCase() === tag.toLowerCase()
      })
    )
  }

  // Pagination
  const totalPosts = posts.length
  const totalPages = Math.ceil(totalPosts / postsPerPage)
  const startIndex = (page - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const currentPosts = posts.slice(startIndex, endIndex)

  // Get all categories and tags for filters
  const categorySet = new Set(posts.map(post => post.category?.name).filter((name): name is string => Boolean(name)))
  const allCategories = Array.from(categorySet)

  const tagSet = new Set(posts.flatMap(post => (post.tags || []).map(tag => typeof tag === 'string' ? tag : tag.name)))
  const allTags = Array.from(tagSet)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {category ? `${category} Articles` : tag ? `Posts tagged "${tag}"` : 'Blog'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {category
              ? `Articles in the ${category} category`
              : tag
              ? `All posts tagged with ${tag}`
              : 'Discover insights, tutorials, and best practices for content management'
            }
          </p>
        </div>

        {/* Filters */}
        {(allCategories.length > 0 || allTags.length > 0) && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-wrap gap-4">
              {/* Category filters */}
              {allCategories.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Categories:</h3>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="/blog"
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        !category && !tag
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </a>
                    {allCategories.map((cat) => (
                      <a
                        key={cat}
                        href={`/blog?category=${encodeURIComponent(cat)}`}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          category === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Tag filters */}
              {allTags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 10).map((tagName) => (
                      <a
                        key={tagName}
                        href={`/blog?tag=${encodeURIComponent(tagName)}`}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          tag === tagName
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        #{tagName}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results summary */}
        <div className="mb-6 text-sm text-gray-600">
          Showing {currentPosts.length} of {totalPosts} posts
          {totalPages > 1 && ` (page ${page} of ${totalPages})`}
        </div>

        {currentPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {category || tag ? 'No posts found matching your filter.' : 'No blog posts available yet.'}
            </p>
            {(category || tag) && (
              <a href="/blog" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
                ← View all posts
              </a>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Domain: {DOMAIN}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {currentPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2 text-gray-900">
                      <a href={`/blog/${post.slug}`} className="hover:text-blue-600">
                        {post.title}
                      </a>
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">
                      {new Date(post.date || post.created_at).toLocaleDateString()}
                      {post.author?.full_name && (
                        <span className="ml-2">by {post.author.full_name}</span>
                      )}
                    </p>
                    {post.excerpt && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.category?.name && (
                        <a
                          href={`/blog?category=${encodeURIComponent(post.category.name)}`}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200"
                        >
                          {post.category.name}
                        </a>
                      )}
                      {post.tags?.slice(0, 3).map((tag, index) => {
                        const tagName = typeof tag === 'string' ? tag : tag.name
                        return (
                        <a
                          key={index}
                          href={`/blog?tag=${encodeURIComponent(tagName)}`}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-200"
                        >
                          #{tagName}
                        </a>
                        )
                      })}
                    </div>
                    <a
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read More →
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                {page > 1 && (
                  <a
                    href={`/blog?page=${page - 1}${category ? `&category=${encodeURIComponent(category)}` : ''}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    ← Previous
                  </a>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <a
                    key={pageNum}
                    href={`/blog?page=${pageNum}${category ? `&category=${encodeURIComponent(category)}` : ''}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </a>
                ))}

                {page < totalPages && (
                  <a
                    href={`/blog?page=${page + 1}${category ? `&category=${encodeURIComponent(category)}` : ''}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Next →
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}