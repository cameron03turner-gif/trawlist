'use client'

import { useState, useEffect } from 'react'

type Props = {
  targetUserId: string
  initialIsFollowing?: boolean
  className?: string
}

export function FollowButton({ targetUserId, initialIsFollowing, className = '' }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing ?? false)
  const [isLoading, setIsLoading] = useState(initialIsFollowing === undefined)

  useEffect(() => {
    if (initialIsFollowing !== undefined) return

    let mounted = true
    async function checkStatus() {
      try {
        const res = await fetch(`/api/follows?targetUserId=${targetUserId}`)
        if (res.ok && mounted) {
          const data = await res.json()
          setIsFollowing(data.isFollowing)
        }
      } catch (err) {
        console.error('Failed to fetch follow status', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    checkStatus()

    return () => {
      mounted = false
    }
  }, [targetUserId, initialIsFollowing])

  async function handleToggle() {
    const action = isFollowing ? 'unfollow' : 'follow'
    const originalState = isFollowing
    
    // Optimistic update
    setIsFollowing(!originalState)

    try {
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, action }),
      })
      if (!res.ok) {
        throw new Error('Failed to toggle follow')
      }
    } catch (err) {
      console.error(err)
      // Revert optimistic update
      setIsFollowing(originalState)
    }
  }

  if (isLoading) {
    return (
      <button 
        disabled 
        className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors border border-border bg-surface-alt text-muted opacity-50 cursor-not-allowed ${className}`}
      >
        Loading...
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors border ${
        isFollowing
          ? 'bg-surface-alt border-border text-ink hover:border-rec/50 hover:text-rec'
          : 'bg-amber text-bg border-transparent hover:brightness-110 shadow-sm'
      } ${className}`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
