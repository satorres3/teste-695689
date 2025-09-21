'use client'

interface Section {
  id: string
  type: string
  content: any
}

interface ContentRendererProps {
  title: string
  sections: Section[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    focusKeyword?: string
  }
}

export default function ContentRenderer({ title, sections, seo }: ContentRendererProps) {
  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'text':
        return (
          <div key={section.id} className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
                 dangerouslySetInnerHTML={{ __html: section.content.text || '' }} />
          </div>
        )

      case 'hero':
        return (
          <section key={section.id} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg mb-8 overflow-hidden">
            <div className="px-8 py-16 text-center">
              <h1 className="text-6xl font-bold mb-6 leading-tight">{section.content.title}</h1>
              {section.content.subtitle && (
                <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">{section.content.subtitle}</p>
              )}
              {section.content.description && (
                <p className="text-lg mb-8 opacity-80 max-w-3xl mx-auto">{section.content.description}</p>
              )}
              {section.content.ctaText && section.content.ctaLink && (
                <a
                  href={section.content.ctaLink}
                  className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {section.content.ctaText}
                </a>
              )}
            </div>
          </section>
        )

      case 'image':
        return (
          <div key={section.id} className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <img
              src={section.content.url}
              alt={section.content.alt || ''}
              className="w-full h-auto rounded-lg shadow-md"
            />
            {section.content.caption && (
              <p className="text-sm text-gray-600 mt-4 text-center italic">{section.content.caption}</p>
            )}
          </div>
        )

      case 'youtube':
        return (
          <div key={section.id} className="mb-8">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${section.content.videoId}${
                  section.content.startTime ? `?start=${section.content.startTime}` : ''
                }`}
                className="w-full h-full rounded-lg"
                allowFullScreen
                title="YouTube video"
              />
            </div>
          </div>
        )

      case 'cta':
        return (
          <section key={section.id} className="bg-blue-50 py-12 rounded-lg mb-8">
            <div className="text-center">
              <p className="text-lg mb-6">{section.content.text}</p>
              <a
                href={section.content.buttonLink}
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {section.content.buttonText}
              </a>
            </div>
          </section>
        )

      case 'faq':
        return (
          <section key={section.id} className="mb-8">
            {section.content.title && (
              <h2 className="text-2xl font-bold mb-6">{section.content.title}</h2>
            )}
            <div className="space-y-4">
              {section.content.items?.map((item: any, index: number) => (
                <details key={index} className="bg-gray-50 p-4 rounded-lg">
                  <summary className="font-semibold cursor-pointer">{item.q}</summary>
                  <p className="mt-2 text-gray-700">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        )

      case 'testimonial':
        return (
          <section key={section.id} className="bg-gray-50 p-8 rounded-lg mb-8 text-center">
            <blockquote className="text-xl italic mb-4">"{section.content.text}"</blockquote>
            <div className="flex items-center justify-center">
              {section.content.avatarUrl && (
                <img
                  src={section.content.avatarUrl}
                  alt={section.content.author}
                  className="w-12 h-12 rounded-full mr-4"
                />
              )}
              <div>
                <p className="font-semibold">{section.content.author}</p>
                {section.content.role && (
                  <p className="text-sm text-gray-600">{section.content.role}</p>
                )}
              </div>
            </div>
          </section>
        )

      case 'staging-notice':
        return (
          <section key={section.id} className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-8 rounded-lg mb-8 shadow-sm">
            <div className="flex items-center">
              <span className="text-3xl mr-4">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-800 text-lg mb-2">{section.content.title}</h3>
                <p className="text-amber-700 leading-relaxed">{section.content.message}</p>
              </div>
            </div>
          </section>
        )

      default:
        return (
          <div key={section.id} className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-8 shadow-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🚧</span>
              <div>
                <p className="text-yellow-800 font-medium">
                  Section type "{section.type}" is not yet supported
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  This content type needs to be implemented in the website renderer
                </p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dynamic page title */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">{title}</h1>
        </div>
      </header>

      {/* Content sections */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {sections.map(renderSection)}

          {sections.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white rounded-lg shadow-sm p-12">
                <p className="text-gray-600 text-lg">No content sections available.</p>
                <p className="text-gray-500 text-sm mt-2">Add content through the CMS to see it here.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}