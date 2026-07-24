'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { MessageSquare, Heart, Reply, LogIn, Flag, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
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
  showFullReviewLink?: boolean
}

/**
 * Hydration-safe Time-Ago component.
 * Renders null on server and initial hydration pass, then smoothly computes relative time after mount.
 */
function MountedTimeAgo({ dateStr, createdStr, prefix = '' }: { dateStr: string; createdStr?: string; prefix?: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !dateStr) return null

  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    const isEdited = createdStr && Math.abs(d.getTime() - new Date(createdStr).getTime()) > 60000
    const dist = formatDistanceToNow(d, { addSuffix: true })
    if (!dist) return null

    const formatted = isEdited ? `edited ${dist}` : dist

    return (
      <span className="text-xs text-muted" suppressHydrationWarning>
        {prefix}{formatted}
      </span>
    )
  } catch {
    return null
  }
}

function ReviewCard({ review, currentUserId, showFullReviewLink = true }: { review: any; currentUserId?: string; showFullReviewLink?: boolean }) {
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

  const [replyCount, setReplyCount] = useState<number>(() => {
    if (review.reply_count != null) return Number(review.reply_count)
    if (Array.isArray(review.review_replies) && review.review_replies[0]?.count != null) return Number(review.review_replies[0].count)
    if (review.review_replies?.count != null) return Number(review.review_replies.count)
    return 0
  })

  useEffect(() => {
    if (review.id && review.reply_count == null && !review.review_replies) {
      const supabase = createClient()
      supabase
        .from('review_replies')
        .select('id', { count: 'exact', head: true })
        .eq('rating_id', review.id)
        .then(({ count }: { count: number | null }) => {
          if (count != null) setReplyCount(count)
        })
    }
  }, [review.id, review.reply_count, review.review_replies])

  const numRating = review.rating != null && !isNaN(Number(review.rating)) ? Number(review.rating) : null
  const authorDisplayName = review.profile?.display_name || review.profile?.username || 'User'
  const authorUsername = review.profile?.username || 'user'
  const authorAvatar = review.profile?.avatar_url

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-amber/30 hover:border-amber transition-all space-y-3 shadow-md hover:shadow-xl hover:shadow-amber/5 relative group">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/u/${authorUsername}`}>
            <Avatar
              url={authorAvatar}
              username={authorUsername}
              displayName={authorDisplayName}
              className="w-10 h-10 text-ink hover:ring-2 hover:ring-amber transition-all shrink-0"
            />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/u/${authorUsername}`} className="font-bold text-ink hover:text-amber transition-colors text-sm truncate">
                {authorDisplayName}
              </Link>
              <Link href={`/u/${authorUsername}`} className="text-xs text-muted hover:underline truncate">
                @{authorUsername}
              </Link>
              {isMine && (
                <span className="text-[10px] font-bold text-amber uppercase tracking-wider bg-amber/10 border border-amber/30 px-1.5 py-0.2 rounded">
                  You
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {numRating !== null && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-amber font-bold font-mono">
                    {numRating.toFixed(1)} ★
                  </span>
                </div>
              )}
              <MountedTimeAgo dateStr={review.updated_at} createdStr={review.created_at} prefix={numRating !== null ? '• ' : ''} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showFullReviewLink && (
            <a
              href={`/reviews/${review.id}`}
              onClick={(e) => {
                e.preventDefault()
                window.location.href = `/reviews/${review.id}`
              }}
              title="View Full Review Page"
              className="p-2 text-muted hover:text-amber hover:bg-amber/10 rounded-lg transition flex items-center justify-center shrink-0 cursor-pointer"
            >
              <ExternalLink size={16} />
            </a>
          )}

          <a
            href={`/reviews/${review.id}`}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/reviews/${review.id}`;
            }}
            title="Reply on full review page"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-alt/50 text-muted hover:text-amber cursor-pointer transition-all"
          >
            <Reply size={14} />
            <span>Reply</span>
          </a>

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

          <button
            onClick={() => {
              if (isMine) return
              setIsReportOpen(true)
            }}
            disabled={isMine}
            title={isMine ? "You cannot report your own review" : "Report review"}
            className={`p-2 rounded-lg text-xs font-semibold transition-all ${
              isMine
                ? 'opacity-30 cursor-not-allowed text-muted bg-surface-alt/20'
                : 'bg-surface-alt/50 text-muted hover:text-amber cursor-pointer'
            }`}
          >
            <Flag size={14} />
          </button>
        </div>
      </div>

      {/* Review Text */}
      {review.review && (
        <div className="text-base text-ink leading-relaxed whitespace-pre-wrap pl-13">
          {review.review}
        </div>
      )}

      {/* Replies Counter Link */}
      <div className="pt-1.5 pl-13 flex items-center gap-2">
        <a
          href={`/reviews/${review.id}`}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/reviews/${review.id}`;
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber hover:underline transition-all cursor-pointer group/replies"
        >
          <MessageSquare size={14} className="group-hover/replies:text-amber transition-colors" />
          <span>
            {`View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
          </span>
        </a>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="review"
        targetId={review.id}
        targetTitle={`Review by @${review.profile?.username || 'user'}`}
      />
    </div>
  )
}

export function VideoReviewsList({ reviews, videoUrl, currentUserId, followingIds = [], showFullReviewLink = true }: VideoReviewsListProps) {
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

    return items
  }, [reviews, network, sortOrder, followingIds])

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
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mb-6 pr-1">
        <div className="flex items-center gap-2 shrink-0">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider whitespace-nowrap">Community Reviews</h3>
          <span className="text-xs text-amber font-mono font-bold bg-amber/10 px-2 py-0.5 rounded-full">
            {filteredReviews.length}
          </span>
        </div>

        {reviews.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {followingIds.length > 0 && (
              <div className="aero-toggle aero-toggle-sm">
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

            <div className="aero-toggle aero-toggle-sm">
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
            <ReviewCard key={r.id || r.user_id} review={r} currentUserId={currentUserId} showFullReviewLink={showFullReviewLink} />
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
