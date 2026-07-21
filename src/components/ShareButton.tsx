'use client'

import { Share } from 'lucide-react'

export function ShareButton({ title, text, url, className, children }: { title: string, text: string, url: string, className?: string, children?: React.ReactNode }) {
  const handleShare = async () => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: fullUrl })
      } catch (err) {
        console.error('Error sharing', err)
      }
    } else {
      alert('Sharing is not supported on this device. Take a screenshot instead!')
    }
  }

  return (
    <button 
      onClick={handleShare}
      className={className || "flex items-center gap-2 bg-amber text-bg font-bold px-4 py-2 rounded-lg hover:bg-amber/90 transition shadow-sm"}
    >
      {children || (
        <>
          <Share size={16} />
          Share Card
        </>
      )}
    </button>
  )
}
