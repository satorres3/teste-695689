import Header from './Header'
import Footer from './Footer'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  siteSettings?: {
    site_name: string
    description?: string
    logo_url?: string
    contact_email?: string
    social_links?: {
      twitter?: string
      facebook?: string
      linkedin?: string
      github?: string
    }
  }
  className?: string
}

export default function Layout({ children, siteSettings, className = '' }: LayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <Header siteSettings={siteSettings} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer siteSettings={siteSettings} />
    </div>
  )
}