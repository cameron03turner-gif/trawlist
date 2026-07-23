'use client'

import { useState, useEffect } from 'react'
import { Clock, UserCheck, UserPlus } from 'lucide-react'

type Props = {
  targetUserId: string
  initialIsFollowing?: boolean
  initialIsPending?: boolean
  className?: string
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  initialIsPending,
  className = '',
}: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing ?? false)
  const [isPending, setIsPending] = useState(initialIsPending ?? false)
  const [isLoading, setIsLoading] = useState(initialIsFollowing === undefined && initialIsPending === undefined)

  useEffect(() => {
    if (initialIsFollowing !== undefined || initialIsPending !== undefined) return

    let mounted = true
    async function checkStatus() {
      try {
        const res = await fetch(`/api/follows?targetUserId=${targetUserId}`)
        if (res.ok && mounted) {
          const data = await res.json()
          setIsFollowing(Boolean(data.isFollowing))
          setIsPending(Boolean(data.isPending))
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
  }, [targetUserId, initialIsFollowing, initialIsPending])

  async function handleToggle() {
    const action = isFollowing || isPending ? 'unfollow' : 'follow'
    const origFollowing = isFollowing
    const origPending = isPending
    
    // Optimistic update
    if (action === 'unfollow') {
      setIsFollowing(false)
      setIsPending(false)
    } else {
      setIsFollowing(false)
      setIsPending(true) // Optimistically assume request sent
    }

    try {
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, action }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setIsFollowing(Boolean(data.isFollowing))
        setIsPending(Boolean(data.isPending))
      } else {
        throw new Error('Failed to toggle follow')
      }
    } catch (err) {
      console.error(err)
      // Revert optimistic update
      setIsFollowing(origFollowing)
      setIsPending(origPending)
    }
  }

  if (isLoading) {
    return (
      <button 
        disabled 
        className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors border border-amber/30 bg-surface-alt text-muted opacity-50 cursor-not-allowed ${className}`}
      >
        Loading...
      </button>
    )
  }

  if (isPending) {
    return (
      <button
        onClick={handleToggle}
        title="Click to cancel follow request"
        className={`px-4 py-2 rounded-full font-semibold text-sm transition-all border bg-surface-alt border-amber/40 text-amber hover:border-rec/50 hover:text-rec flex items-center justify-center gap-1.5 ${className}`}
      >
        <Clock size={13} className="animate-spin-slow" />
        <span>Requested</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className={`px-4 py-2 rounded-full font-semibold text-sm transition-all border flex items-center justify-center gap-1.5 ${
        isFollowing
          ? 'bg-surface-alt border-amber/30 text-ink hover:border-rec/50 hover:text-rec'
          : 'bg-amber text-bg border-transparent hover:brightness-110 shadow-sm'
      } ${className}`}
    >
      {isFollowing ? (
        <>
          <UserCheck size={14} />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus size={14} />
          <span>Follow</span>
        </>
      )}
    </button>
  )
}
