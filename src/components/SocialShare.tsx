'use client'

interface SocialShareProps {
  title: string
  url: string
}

export default function SocialShare({ title, url }: SocialShareProps) {
  const shareText = encodeURIComponent(title)
  const shareUrl = encodeURIComponent(url)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      // You could add a toast notification here
      alert('Link copied to clipboard!')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
      >
        Twitter
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-700 text-white px-3 py-1 rounded text-sm hover:bg-blue-800 transition-colors"
      >
        Facebook
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
      >
        LinkedIn
      </a>
      <button
        onClick={copyToClipboard}
        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
      >
        Copy Link
      </button>
    </div>
  )
}