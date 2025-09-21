import { Metadata } from 'next'
import { ContentLibrary } from '../../lib/content'
import ContentRenderer from '../components/ContentRenderer'
import type { Page, Post, ContentSection } from '../../types/content'

export const metadata: Metadata = {
  title: 'How to MeCM - Professional Content Management',
  description: 'Learn professional content management techniques and tools',
}

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

export default async function HomePage() {
  // Try to get the home page content from CMS using enhanced content library
  const homePageResult = await ContentLibrary.getPageBySlug(DOMAIN, 'home')
  const recentPostsResult = await ContentLibrary.getRecentPosts(DOMAIN, 6)

  // Extract data with error handling
  const homePage = homePageResult.success ? homePageResult.data : null
  const recentPosts = recentPostsResult.success ? recentPostsResult.data || [] : []

  // If we have CMS content, render it
  if (homePage) {
    return (
      <main className="min-h-screen">
        <ContentRenderer
          title={homePage.title}
          sections={getPageSections(homePage)}
          seo={homePage.seo}
        />

        {/* Show recent posts if available */}
        {recentPosts.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8">Latest Posts</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                    <a
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read More →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    )
  }

  // Fallback content if no CMS content is available
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to How to MeCM
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your professional content management system is being prepared.
            This staging environment will mirror your production site.
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🚧 Under Construction
            </h2>
            <p className="text-gray-600">
              This is the staging environment for howtomecm.com.
              Content will be dynamically generated from the CMS.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Domain: {DOMAIN}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}