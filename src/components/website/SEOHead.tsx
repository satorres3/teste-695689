interface SEOHeadProps {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  canonicalUrl?: string
  articleData?: {
    publishedTime?: string
    modifiedTime?: string
    author?: string
    tags?: string[]
  }
  siteData?: {
    siteName: string
    siteUrl: string
    twitterHandle?: string
  }
}

export default function SEOHead({
  title,
  description,
  keywords,
  ogImage,
  canonicalUrl,
  articleData,
  siteData,
}: SEOHeadProps) {
  const fullTitle = siteData?.siteName ? `${title} | ${siteData.siteName}` : title
  const imageUrl = ogImage || `${siteData?.siteUrl}/og-image.jpg`
  const url = canonicalUrl || siteData?.siteUrl

  // Generate structured data for articles
  const generateArticleSchema = () => {
    if (!articleData || !siteData) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      image: imageUrl,
      url: url,
      datePublished: articleData.publishedTime,
      dateModified: articleData.modifiedTime || articleData.publishedTime,
      author: {
        '@type': 'Person',
        name: articleData.author || 'Anonymous',
      },
      publisher: {
        '@type': 'Organization',
        name: siteData.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${siteData.siteUrl}/logo.png`,
        },
      },
      keywords: articleData.tags?.join(', '),
    }
  }

  const articleSchema = generateArticleSchema()

  return (
    <>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={articleData ? 'article' : 'website'} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      {siteData?.siteName && (
        <meta property="og:site_name" content={siteData.siteName} />
      )}

      {/* Article-specific Open Graph tags */}
      {articleData && (
        <>
          {articleData.publishedTime && (
            <meta property="article:published_time" content={articleData.publishedTime} />
          )}
          {articleData.modifiedTime && (
            <meta property="article:modified_time" content={articleData.modifiedTime} />
          )}
          {articleData.author && (
            <meta property="article:author" content={articleData.author} />
          )}
          {articleData.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {siteData?.twitterHandle && (
        <meta name="twitter:site" content={siteData.twitterHandle} />
      )}

      {/* Additional meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />

      {/* Structured data */}
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleSchema),
          }}
        />
      )}

      {/* Favicon and app icons */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* RSS feed */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${siteData?.siteName} RSS Feed`}
        href="/rss.xml"
      />
    </>
  )
}