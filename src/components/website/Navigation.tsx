'use client'

import { useState } from 'react'

interface NavigationItem {
  name: string
  href: string
  current?: boolean
}

interface NavigationProps {
  items: NavigationItem[]
  className?: string
}

export default function Navigation({ items, className = '' }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className={className}>
      {/* Desktop navigation */}
      <div className="hidden md:flex space-x-8">
        {items.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              item.current
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            {item.name}
          </a>
        ))}
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden">
        <button
          type="button"
          className="text-gray-700 hover:text-blue-600 p-2 rounded-md"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Mobile menu */}
        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {items.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    item.current
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}