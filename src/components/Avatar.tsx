'use client'

import { useState } from 'react'

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
      <img 
        src={url} 
        alt={displayName || username} 
        className={`rounded-full object-cover ${className}`}
        onError={() => setError(true)}
      />
    )
  }
  
  return (
    <div className={`rounded-full bg-surface flex items-center justify-center font-bold overflow-hidden ${className}`}>
      {displayName?.[0]?.toUpperCase() || username[0].toUpperCase()}
    </div>
  )
}
