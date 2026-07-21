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
        className={`px-4 py-2 rounded-full font-medium text-sm transition-colors border border-transparent bg-neutral-800 text-neutral-400 opacity-50 cursor-not-allowed ${className}`}
      >
        Loading...
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className={`px-4 py-2 rounded-full font-medium text-sm transition-colors border ${
        isFollowing
          ? 'bg-transparent border-neutral-700 text-neutral-300 hover:border-red-500/50 hover:text-red-400'
          : 'bg-white text-black hover:bg-neutral-200 border-transparent'
      } ${className}`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
