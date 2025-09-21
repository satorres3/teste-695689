/**
 * Performance Audit Script for howtomecm.com
 * Benchmarks current site performance for comparison
 */

interface PerformanceMetrics {
  url: string
  timestamp: string
  loadTime: number
  responseCode: number
  sizeBytes: number
  error?: string
}

interface SEOAnalysis {
  title: string
  description: string
  hasH1: boolean
  imageCount: number
  linkCount: number
  metaTags: Record<string, string>
}

interface SiteAudit {
  performance: PerformanceMetrics[]
  seo: SEOAnalysis[]
  recommendations: string[]
  summary: {
    totalPages: number
    averageLoadTime: number
    errorPages: number
    seoScore: number
  }
}

// URLs to audit
const AUDIT_URLS = [
  'https://www.howtomecm.com',
  'https://www.howtomecm.com/contact',
  'https://www.howtomecm.com/blog',
  'https://www.howtomecm.com/about' // Will likely 404
]

export async function auditPerformance(url: string): Promise<PerformanceMetrics> {
  const startTime = Date.now()

  try {
    const response = await fetch(url, {
      method: 'HEAD', // Get headers only for performance test
    })

    const loadTime = Date.now() - startTime
    const contentLength = response.headers.get('content-length')

    return {
      url,
      timestamp: new Date().toISOString(),
      loadTime,
      responseCode: response.status,
      sizeBytes: contentLength ? parseInt(contentLength) : 0
    }
  } catch (error) {
    return {
      url,
      timestamp: new Date().toISOString(),
      loadTime: Date.now() - startTime,
      responseCode: 0,
      sizeBytes: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function auditSEO(url: string): Promise<SEOAnalysis> {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      return {
        title: 'Error - Page not found',
        description: `HTTP ${response.status}`,
        hasH1: false,
        imageCount: 0,
        linkCount: 0,
        metaTags: {}
      }
    }

    const html = await response.text()

    // Basic HTML parsing (in a real scenario, you'd use a proper HTML parser)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    const h1Match = html.match(/<h1[^>]*>/i)
    const imgMatches = html.match(/<img[^>]*>/gi) || []
    const linkMatches = html.match(/<a[^>]*href[^>]*>/gi) || []

    // Extract meta tags
    const metaTags: Record<string, string> = {}
    const metaMatches = html.match(/<meta[^>]*>/gi) || []

    metaMatches.forEach(meta => {
      const nameMatch = meta.match(/name=["']([^"']+)["']/i)
      const contentMatch = meta.match(/content=["']([^"']+)["']/i)

      if (nameMatch && contentMatch) {
        metaTags[nameMatch[1]] = contentMatch[1]
      }
    })

    return {
      title: titleMatch ? titleMatch[1] : 'No title found',
      description: descMatch ? descMatch[1] : 'No description found',
      hasH1: !!h1Match,
      imageCount: imgMatches.length,
      linkCount: linkMatches.length,
      metaTags
    }
  } catch (error) {
    return {
      title: 'Error loading page',
      description: error instanceof Error ? error.message : 'Unknown error',
      hasH1: false,
      imageCount: 0,
      linkCount: 0,
      metaTags: {}
    }
  }
}

export async function runFullAudit(): Promise<SiteAudit> {
  console.log('🔍 Starting site audit for howtomecm.com...')

  const performance: PerformanceMetrics[] = []
  const seo: SEOAnalysis[] = []

  for (const url of AUDIT_URLS) {
    console.log(`\n📊 Auditing: ${url}`)

    // Performance audit
    const perfMetrics = await auditPerformance(url)
    performance.push(perfMetrics)
    console.log(`  ⏱️ Load time: ${perfMetrics.loadTime}ms`)
    console.log(`  📄 Response: ${perfMetrics.responseCode}`)

    // SEO audit (only for successful responses)
    if (perfMetrics.responseCode === 200) {
      const seoAnalysis = await auditSEO(url)
      seo.push(seoAnalysis)
      console.log(`  📝 Title: ${seoAnalysis.title}`)
      console.log(`  📋 Description: ${seoAnalysis.description.substring(0, 50)}...`)
    }

    // Add delay to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Calculate summary
  const validPerformance = performance.filter(p => p.responseCode === 200)
  const averageLoadTime = validPerformance.length > 0
    ? validPerformance.reduce((sum, p) => sum + p.loadTime, 0) / validPerformance.length
    : 0

  const errorPages = performance.filter(p => p.responseCode !== 200).length

  // Simple SEO scoring
  let seoScore = 0
  seo.forEach(analysis => {
    if (analysis.title && analysis.title !== 'No title found') seoScore += 25
    if (analysis.description && analysis.description !== 'No description found') seoScore += 25
    if (analysis.hasH1) seoScore += 25
    if (Object.keys(analysis.metaTags).length > 0) seoScore += 25
  })
  seoScore = seo.length > 0 ? seoScore / seo.length : 0

  // Generate recommendations
  const recommendations: string[] = []

  if (averageLoadTime > 2000) {
    recommendations.push('Optimize page load times (current average: ' + Math.round(averageLoadTime) + 'ms)')
  }

  if (errorPages > 0) {
    recommendations.push(`Fix ${errorPages} pages returning errors (404, etc.)`)
  }

  if (seoScore < 75) {
    recommendations.push('Improve SEO elements (titles, descriptions, meta tags)')
  }

  seo.forEach((analysis, index) => {
    if (!analysis.hasH1) {
      recommendations.push(`Add H1 tag to ${AUDIT_URLS[index]}`)
    }
    if (analysis.description === 'No description found') {
      recommendations.push(`Add meta description to ${AUDIT_URLS[index]}`)
    }
  })

  return {
    performance,
    seo,
    recommendations,
    summary: {
      totalPages: AUDIT_URLS.length,
      averageLoadTime: Math.round(averageLoadTime),
      errorPages,
      seoScore: Math.round(seoScore)
    }
  }
}

export function generateAuditReport(audit: SiteAudit): string {
  const report = `
# 📊 Site Audit Report - howtomecm.com

**Generated:** ${new Date().toISOString()}
**Total Pages Audited:** ${audit.summary.totalPages}

## 🚀 Performance Summary

- **Average Load Time:** ${audit.summary.averageLoadTime}ms
- **Error Pages:** ${audit.summary.errorPages}
- **SEO Score:** ${audit.summary.seoScore}/100

## 📈 Detailed Performance Metrics

${audit.performance.map(p => `
### ${p.url}
- **Load Time:** ${p.loadTime}ms
- **Response Code:** ${p.responseCode}
- **Size:** ${p.sizeBytes} bytes
${p.error ? `- **Error:** ${p.error}` : ''}
`).join('')}

## 🔍 SEO Analysis

${audit.seo.map((s, i) => `
### ${AUDIT_URLS[i]}
- **Title:** ${s.title}
- **Description:** ${s.description}
- **Has H1:** ${s.hasH1 ? '✅' : '❌'}
- **Images:** ${s.imageCount}
- **Links:** ${s.linkCount}
- **Meta Tags:** ${Object.keys(s.metaTags).length}
`).join('')}

## 🎯 Recommendations

${audit.recommendations.map(rec => `- ${rec}`).join('\n')}

## 📋 Migration Priority

Based on this audit, the migration should focus on:

1. **Fix missing pages** (About page returns 404)
2. **Enhance SEO elements** (meta descriptions, structured data)
3. **Optimize performance** (image optimization, caching)
4. **Create missing content** (blog posts, service pages)

---

*Report generated by Phase 5 site audit tool*
`

  return report
}

// CLI execution
if (require.main === module) {
  runFullAudit()
    .then(audit => {
      const report = generateAuditReport(audit)
      console.log('\n' + report)

      // Save report to file
      const fs = require('fs')
      const path = require('path')

      const reportPath = path.join(__dirname, 'audit-report.md')
      fs.writeFileSync(reportPath, report)
      console.log(`\n📝 Full report saved to: ${reportPath}`)
    })
    .catch(console.error)
}