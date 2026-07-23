'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { MessageSquare, Heart, Reply, LogIn, Flag, Circle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Scrubber } from './Scrubber'
import { Avatar } from './Avatar'
import { toggleReviewLike } from '@/app/actions/review-likes'
import { ReviewRepliesSection } from './ReviewRepliesSection'
import { ReportModal } from './ReportModal'

type VideoReviewsListProps = {
  reviews: any[]
  videoUrl: string
  currentUserId?: string
  followingIds?: string[]
}

/**
 * Hydration-safe Time-Ago component.
 * Renders null on server and initial hydration pass, then smoothly computes relative time after mount.
 */
function MountedTimeAgo({ dateStr, prefix = '' }: { dateStr?: string | null; prefix?: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !dateStr) return null

  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    const formatted = formatDistanceToNow(d, { addSuffix: true })
    if (!formatted) return null
    return (
      <span className="text-xs text-muted" suppressHydrationWarning>
        {prefix}{formatted}
      </span>
    )
  } catch {
    return null
  }
}

function ReviewCard({ review, currentUserId }: { review: any; currentUserId?: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isMine = mounted && !!(currentUserId && review.user_id === currentUserId)
  const [isLiked, setIsLiked] = useState<boolean>(!!review.is_liked)
  const [likeCount, setLikeCount] = useState<number>(review.like_count || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const handleToggleLike = async () => {
    if (!currentUserId || isLiking) return

    const nextIsLiked = !isLiked
    const nextLikeCount = nextIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1)

    setIsLiked(nextIsLiked)
    setLikeCount(nextLikeCount)
    setIsLiking(true)

    const res = await toggleReviewLike(review.id)
    if (!res.success) {
      setIsLiked(!nextIsLiked)
      setLikeCount(likeCount)
    }
    setIsLiking(false)
  }

  const numRating = review.rating != null && !isNaN(Number(review.rating)) ? Number(review.rating) : null

  return (
    <>
      <div className={`p-4 sm:p-5 rounded-xl border transition-all ${
        isMine ? 'bg-amber/5 border-amber shadow-sm' : 'bg-surface border-amber'
      } relative hover:scale-[1.01] hover:shadow-xl hover:shadow-amber/10 duration-300`}>
        
        {/* Review Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link href={`/u/${review.profile?.username || 'user'}`}>
              <Avatar
                url={review.profile?.avatar_url}
                username={review.profile?.username || 'user'}
                displayName={review.profile?.display_name}
                className="w-10 h-10 text-ink hover:ring-2 hover:ring-amber transition-all"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/u/${review.profile?.username || 'user'}`} className="text-base font-bold text-ink hover:text-amber transition-colors">
                  {review.profile?.display_name || review.profile?.username || 'User'}
                </Link>
                {isMine && (
                  <span className="text-[10px] font-bold text-amber uppercase tracking-wider bg-amber/10 px-2 py-0.5 rounded">
                    Your Review
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {numRating !== null && (
                  <div className="flex items-center gap-1.5">
                    <Scrubber value={numRating} interactive={false} height={12} />
                    <span className="text-xs text-muted font-mono">{numRating.toFixed(1)}</span>
                  </div>
                )}
                <MountedTimeAgo dateStr={review.updated_at} prefix={numRating !== null ? '• ' : ''} />
              </div>
            </div>
          </div>

          {/* Action Buttons: Full Review Link (Circle), Reply, Like, Flag */}
          <div className="flex items-center gap-1.5">
            {review.id && (
              <Link
                href={`/reviews/${review.id}`}
                title="View Full Review Page"
                className="w-7 h-7 rounded-full bg-amber/15 text-amber border border-amber/40 hover:bg-amber hover:text-bg transition-all flex items-center justify-center shadow-sm shrink-0 cursor-pointer"
              >
                <Circle size={14} />
              </Link>
            )}

            <button
              onClick={() => {
                if (currentUserId) {
                  setIsReplying(prev => !prev)
                }
              }}
              title={currentUserId ? "Reply to review" : "Sign in to reply"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !currentUserId ? 'opacity-60 bg-surface-alt/30 text-muted' : 'bg-surface-alt/50 text-muted hover:text-amber cursor-pointer'
              }`}
            >
              <Reply size={14} />
              <span>Reply</span>
            </button>

            <button
              onClick={handleToggleLike}
              disabled={!currentUserId || isLiking}
              title={currentUserId ? (isLiked ? 'Unlike review' : 'Like review') : 'Sign in to like reviews'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isLiked
                  ? 'bg-rec/10 text-rec'
                  : 'bg-surface-alt/50 text-muted hover:text-ink'
              } ${!currentUserId ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Heart size={14} className={isLiked ? 'fill-rec text-rec' : ''} />
              <span>{likeCount}</span>
            </button>

            {!isMine && (
              <button
                onClick={() => setIsReportOpen(true)}
                title="Report review"
                className="p-2 rounded-lg text-xs font-semibold bg-surface-alt/50 text-muted hover:text-amber transition-all cursor-pointer"
              >
                <Flag size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Review Text */}
        {review.review && (
          <div className="text-base text-ink leading-relaxed whitespace-pre-wrap pl-13">
            {review.review}
          </div>
        )}

        {/* Replies Section */}
        <ReviewRepliesSection
          ratingId={review.id}
          currentUserId={currentUserId}
          isReplyingExternal={isReplying}
          onCancelReplyingExternal={() => setIsReplying(false)}
        />
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="review"
        targetId={review.id}
        targetTitle={`Review by @${review.profile?.username || 'user'}`}
      />
    </>
  )
}

export function VideoReviewsList({ reviews, videoUrl, currentUserId, followingIds = [] }: VideoReviewsListProps) {
  const [sortOrder, setSortOrder] = useState<'recent' | 'popular'>('popular')
  const [network, setNetwork] = useState<'community' | 'following'>('community')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const filteredReviews = useMemo(() => {
    let items = [...reviews]

    if (network === 'following' && followingIds.length > 0) {
      items = items.filter(
        r => followingIds.includes(r.user_id) || (currentUserId && r.user_id === currentUserId)
      )
    }

    if (sortOrder === 'popular') {
      items.sort((a, b) => {
        const diff = (b.like_count || 0) - (a.like_count || 0)
        if (diff !== 0) return diff
        const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0
        return timeB - timeA
      })
    } else {
      items.sort((a, b) => {
        const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0
        return timeB - timeA
      })
    }

    if (currentUserId) {
      const myIndex = items.findIndex(r => r.user_id === currentUserId)
      if (myIndex > -1) {
        const [myReview] = items.splice(myIndex, 1)
        items.unshift(myReview)
      }
    }

    return items
  }, [reviews, network, sortOrder, followingIds, currentUserId])

  const totalPages = Math.ceil(filteredReviews.length / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const displayedReviews = filteredReviews.slice(startIndex, startIndex + pageSize)

  const handleNetworkChange = (val: 'community' | 'following') => {
    setNetwork(val)
    setCurrentPage(1)
  }

  const handleSortChange = (val: 'recent' | 'popular') => {
    setSortOrder(val)
    setCurrentPage(1)
  }

  return (
    <div className="pt-3 mt-2">
      {/* List Filter & Sort Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Community Reviews</h3>
          <span className="text-xs text-amber font-mono font-bold bg-amber/10 px-2 py-0.5 rounded-full">
            {filteredReviews.length}
          </span>
        </div>

        {reviews.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            {followingIds.length > 0 && (
              <div className="aero-toggle">
                <button
                  onClick={() => handleNetworkChange('community')}
                  data-active={network === 'community'}
                >
                  Community
                </button>
                <button
                  onClick={() => handleNetworkChange('following')}
                  data-active={network === 'following'}
                >
                  Following
                </button>
              </div>
            )}

            <div className="aero-toggle">
              <button
                onClick={() => handleSortChange('popular')}
                data-active={sortOrder === 'popular'}
              >
                Popular
              </button>
              <button
                onClick={() => handleSortChange('recent')}
                data-active={sortOrder === 'recent'}
              >
                Recent
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Cards List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-amber">
          <MessageSquare className="mx-auto text-amber/60 mb-3" size={36} />
          <p className="text-base font-bold text-ink mb-1">
            {network === 'following' ? 'No reviews from people you follow' : 'No reviews yet'}
          </p>
          <p className="text-sm text-muted mb-4 max-w-sm mx-auto">
            {network === 'following'
              ? 'None of the creators or users you follow have reviewed this video yet.'
              : 'Be the first to share your thoughts and rate this video for the community.'}
          </p>
          {currentUserId ? (
            <Link
              href={`?logUrl=${encodeURIComponent(videoUrl)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber text-bg hover:brightness-110 transition text-sm font-bold shadow-lg shadow-amber/10"
            >
              <MessageSquare size={16} />
              Be the first to review
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber text-bg hover:brightness-110 transition text-sm font-bold shadow-lg shadow-amber/10"
            >
              <LogIn size={16} />
              Sign in to review
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((r: any) => (
            <ReviewCard key={r.id || r.user_id} review={r} currentUserId={currentUserId} />
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-6">
              <span className="text-xs text-muted font-medium">
                Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filteredReviews.length)} of {filteredReviews.length} reviews
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-amber/30 text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber/10 transition cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-xs text-muted font-mono">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-amber/30 text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber/10 transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
