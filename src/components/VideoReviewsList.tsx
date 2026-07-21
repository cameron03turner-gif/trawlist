'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { Scrubber } from './Scrubber'

type VideoReviewsListProps = {
  reviews: any[]
  videoUrl: string
  currentUserId?: string
  followingIds?: string[]
}

export function VideoReviewsList({ reviews, videoUrl, currentUserId, followingIds = [] }: VideoReviewsListProps) {
  const [sortOrder, setSortOrder] = useState<'recent' | 'popular'>('popular')
  const [network, setNetwork] = useState<'community' | 'following'>('community')
  const [showAllReviews, setShowAllReviews] = useState(false)

  let sortedReviews = [...reviews]
  
  if (network === 'following') {
    sortedReviews = sortedReviews.filter(r => followingIds.includes(r.user_id) || (currentUserId && r.user_id === currentUserId))
  }

  if (sortOrder === 'popular') {
    sortedReviews.sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
  }
  
  if (currentUserId) {
    const myIndex = sortedReviews.findIndex(r => r.user_id === currentUserId)
    if (myIndex > -1) {
      const [myReview] = sortedReviews.splice(myIndex, 1)
      sortedReviews.unshift(myReview)
    }
  }

  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 5)

  return (
    <div className="pt-8 mt-8 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Community Reviews</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="aero-toggle">
              <button 
                onClick={() => setNetwork('community')}
                data-active={network === 'community'}
              >
                Community
              </button>
              <button 
                onClick={() => setNetwork('following')}
                data-active={network === 'following'}
              >
                Following
              </button>
            </div>
            <div className="aero-toggle">
              <button 
                onClick={() => setSortOrder('recent')}
                data-active={sortOrder === 'recent'}
              >
                Recent
              </button>
              <button 
                onClick={() => setSortOrder('popular')}
                data-active={sortOrder === 'popular'}
              >
                Popular
              </button>
            </div>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-amber">
          <MessageSquare className="mx-auto text-muted mb-3" size={32} />
          <p className="text-base font-medium text-ink mb-1">No reviews yet</p>
          <p className="text-sm text-muted mb-4">Be the first to share your thoughts on this video.</p>
          <Link 
            href={`?logUrl=${encodeURIComponent(videoUrl)}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber text-bg hover:brightness-110 transition text-sm font-bold"
          >
            Review this video
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((r: any, i: number) => {
            const isMine = currentUserId && r.user_id === currentUserId
            return (
              <div key={i} className="p-5 bg-surface border border-amber rounded-xl relative">
                {isMine && (
                  <div className="absolute top-5 right-5 flex items-center gap-3">
                    <span className="text-[10px] font-bold text-amber uppercase tracking-wider bg-amber/10 px-2 py-1 rounded">Your Review</span>
                  </div>
                )}
                <div className="flex items-center gap-4 mb-3">
                  <Link href={`/u/${r.profile.username}`}>
                    {r.profile.avatar_url ? (
                      <img src={r.profile.avatar_url} className="w-10 h-10 rounded-full object-cover border border-border/50" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-sm font-bold border border-border/50 text-ink">
                        {r.profile.display_name?.[0]?.toUpperCase() || r.profile.username[0].toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div>
                    <Link href={`/u/${r.profile.username}`} className="text-base font-bold hover:text-amber transition-colors">
                      {r.profile.display_name || r.profile.username}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Scrubber value={Number(r.rating)} interactive={false} height={12} />
                      <span className="text-xs text-muted font-mono ml-1">{Number(r.rating).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-base text-ink leading-relaxed whitespace-pre-wrap pl-14">
                  {r.review}
                </div>
              </div>
            )
          })}
          
          {reviews.length > 5 && !showAllReviews && (
            <button 
              onClick={() => setShowAllReviews(true)}
              className="w-full py-3 mt-2 text-sm font-bold text-muted hover:text-ink bg-surface rounded-xl transition-colors border border-transparent hover:border-amber"
            >
              Show all {reviews.length} reviews
            </button>
          )}
        </div>
      )}
    </div>
  )
}
