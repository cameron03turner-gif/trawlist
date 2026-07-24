'use client'

import { useState } from 'react'
import Image from 'next/image'

type AvatarProps = {
  url?: string | null
  username: string
  displayName?: string | null
  className?: string
}

export function Avatar({ url, username, displayName, className = "w-6 h-6" }: AvatarProps) {
  const [error, setError] = useState(false)
  
  if (url && !error) {
    return (
      <div className={`relative rounded-full overflow-hidden shrink-0 ${className}`}>
        <Image 
          src={url} 
          alt={displayName || username} 
          fill
          sizes="96px"
          className="object-cover rounded-full"
          onError={() => setError(true)}
          unoptimized={url.startsWith('data:')}
        />
      </div>
    )
  }
  
  return (
    <div className={`rounded-full bg-surface flex items-center justify-center font-bold overflow-hidden ${className}`}>
      {displayName?.[0]?.toUpperCase() || username[0].toUpperCase()}
    </div>
  )
}
