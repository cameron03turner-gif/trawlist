'use client'

import { useState, useEffect } from 'react'
import { FeedItemCard } from './FeedItemCard'
import { Loader2, Users } from 'lucide-react'
import Link from 'next/link'

type Props = {
  initialType?: 'following' | 'community'
  userId?: string
}

export function ActivityFeed({ initialType = 'community', userId }: Props) {
  const [feedType, setFeedType] = useState(initialType)
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function fetchFeed() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/feed?type=${feedType}`)
        if (!res.ok) throw new Error('Failed to load feed')
        const data = await res.json()
        if (mounted) setItems(data.items || [])
      } catch (err: any) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    fetchFeed()

    return () => {
      mounted = false
    }
  }, [feedType])

  return (
    <div className="max-w-4xl mx-auto w-full pb-12">
      {/* Feed type toggle if user is signed in */}
      {userId && (
        <div className="flex justify-center mb-6">
          <div className="aero-toggle">
            <button
              onClick={() => setFeedType('community')}
              data-active={feedType === 'community'}
            >
              Community
            </button>
            <button
              onClick={() => setFeedType('following')}
              data-active={feedType === 'following'}
            >
              Following
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-muted" size={32} />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-rec">
          <p>{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-border rounded-xl">
          <Users className="mx-auto text-muted mb-4" size={32} />
          <h3 className="text-xl font-semibold text-ink mb-2">
            {feedType === 'following' ? 'No following activity' : 'No activity yet'}
          </h3>
          <p className="text-muted mb-6">
            {feedType === 'following'
              ? "Follow some friends to see what they're watching!"
              : "No recent activity in the community."}
          </p>
          {feedType === 'following' && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/videos"
                className="px-4 py-2 bg-amber text-bg text-sm font-bold rounded-lg hover:brightness-110 transition-all"
              >
                Explore Leaderboard
              </Link>
              <button
                onClick={() => setFeedType('community')}
                className="px-4 py-2 bg-surface-alt border border-border text-ink text-sm font-semibold rounded-lg hover:bg-surface transition-colors"
              >
                View Community Activity
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <FeedItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
