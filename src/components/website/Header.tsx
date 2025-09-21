import { ContentLibrary } from '../../../lib/content'
import Navigation from './Navigation'

const DOMAIN = (process.env.WEBSITE_DOMAIN || 'staging.howtomecm.com').trim()

interface HeaderProps {
  siteSettings?: {
    site_name: string
    logo_url?: string
  }
}

export default async function Header({ siteSettings }: HeaderProps) {
  // Get site settings if not provided
  let settings = siteSettings
  if (!settings) {
    const settingsResult = await ContentLibrary.getSiteSettings(DOMAIN)
    settings = settingsResult.success ? settingsResult.data : null
  }

  const siteName = settings?.site_name || 'How to MeCM'
  const logoUrl = settings?.logo_url

  // Navigation items - these could also come from CMS
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const isStaging = DOMAIN.includes('staging')

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Staging banner */}
      {isStaging && (
        <div className="bg-amber-500 text-amber-900 text-center py-2 px-4">
          <p className="text-sm font-medium">
            🚧 This is a staging environment. The live site is at{' '}
            <a href="https://howtomecm.com" className="underline font-semibold">
              howtomecm.com
            </a>
          </p>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Site name */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-8 w-auto" />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {siteName.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-xl font-bold text-gray-900">{siteName}</span>
            </a>
          </div>

          {/* Navigation */}
          <Navigation items={navigation} />
        </div>
      </div>
    </header>
  )
}