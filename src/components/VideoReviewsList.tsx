'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Heart, ChevronLeft, ChevronRight, Reply } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Scrubber } from './Scrubber'
import { Avatar } from './Avatar'
import { toggleReviewLike } from '@/app/actions/review-likes'
import { ReviewRepliesSection } from './ReviewRepliesSection'

type VideoReviewsListProps = {
  reviews: any[]
  videoUrl: string
  currentUserId?: string
  followingIds?: string[]
}

function ReviewCard({ review, currentUserId }: { review: any; currentUserId?: string }) {
  const isMine = currentUserId && review.user_id === currentUserId
  const [isLiked, setIsLiked] = useState<boolean>(!!review.is_liked)
  const [likeCount, setLikeCount] = useState<number>(review.like_count || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [isReplying, setIsReplying] = useState(false)

  const handleToggleLike = async () => {
    if (!currentUserId || isLiking) return

    // Optimistic update
    const nextIsLiked = !isLiked
    const nextLikeCount = nextIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1)
    
    setIsLiked(nextIsLiked)
    setLikeCount(nextLikeCount)
    setIsLiking(true)

    const res = await toggleReviewLike(review.id)
    if (!res.success) {
      // Revert if failed
      setIsLiked(!nextIsLiked)
      setLikeCount(likeCount)
    }
    setIsLiking(false)
  }

  const formattedTime = review.updated_at
    ? formatDistanceToNow(new Date(review.updated_at), { addSuffix: true })
    : null

  return (
    <div className="p-4 bg-surface border border-amber rounded-xl relative hover:scale-[1.01] hover:shadow-xl hover:shadow-amber/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <Link href={`/u/${review.profile?.username}`}>
            <Avatar
              url={review.profile?.avatar_url}
              username={review.profile?.username}
              displayName={review.profile?.display_name}
              className="w-10 h-10 text-ink hover:ring-2 hover:ring-amber transition-all"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/u/${review.profile?.username}`} className="text-base font-bold text-ink hover:text-amber transition-colors">
                {review.profile?.display_name || review.profile?.username}
              </Link>
              {isMine && (
                <span className="text-[10px] font-bold text-amber uppercase tracking-wider bg-amber/10 px-2 py-0.5 rounded">
                  Your Review
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {review.rating !== null && (
                <div className="flex items-center gap-1.5">
                  <Scrubber value={Number(review.rating)} interactive={false} height={12} />
                  <span className="text-xs text-muted font-mono">{Number(review.rating).toFixed(1)}</span>
                </div>
              )}
              {formattedTime && (
                <span className="text-xs text-muted">
                  {review.rating !== null ? '•' : ''} {formattedTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: Like & Reply */}
        <div className="flex items-center gap-2">
          {currentUserId && (
            <button
              onClick={() => setIsReplying(prev => !prev)}
              title="Reply to review"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-alt/50 text-muted hover:text-amber transition-all"
            >
              <Reply size={14} />
              <span>Reply</span>
            </button>
          )}

          {/* Like Button */}
          <button
            onClick={handleToggleLike}
            disabled={!currentUserId || isLiking}
            title={currentUserId ? (isLiked ? 'Unlike review' : 'Like review') : 'Sign in to like reviews'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isLiked
                ? 'bg-rec/10 text-rec'
                : 'bg-surface-alt/50 text-muted hover:text-ink'
            } ${!currentUserId ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <Heart size={14} className={isLiked ? 'fill-rec text-rec' : ''} />
            <span>{likeCount}</span>
          </button>
        </div>
      </div>

      <div className="text-base text-ink leading-relaxed whitespace-pre-wrap pl-13">
        {review.review}
      </div>

      {/* YouTube Style Reply Chain Section */}
      <ReviewRepliesSection
        ratingId={review.id}
        currentUserId={currentUserId}
        isReplyingExternal={isReplying}
        onCancelReplyingExternal={() => setIsReplying(false)}
      />
    </div>
  )
}

export function VideoReviewsList({ reviews, videoUrl, currentUserId, followingIds = [] }: VideoReviewsListProps) {
  const [sortOrder, setSortOrder] = useState<'recent' | 'popular'>('popular')
  const [network, setNetwork] = useState<'community' | 'following'>('community')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  let filteredReviews = [...reviews]
  
  if (network === 'following') {
    filteredReviews = filteredReviews.filter(
      r => followingIds.includes(r.user_id) || (currentUserId && r.user_id === currentUserId)
    )
  }

  if (sortOrder === 'popular') {
    filteredReviews.sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
  } else {
    filteredReviews.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }
  
  // Pin user's own review to the top if present
  if (currentUserId) {
    const myIndex = filteredReviews.findIndex(r => r.user_id === currentUserId)
    if (myIndex > -1) {
      const [myReview] = filteredReviews.splice(myIndex, 1)
      filteredReviews.unshift(myReview)
    }
  }

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
    <div className="pt-8 mt-8">
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

      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl">
          <MessageSquare className="mx-auto text-amber/60 mb-3" size={36} />
          <p className="text-base font-bold text-ink mb-1">
            {network === 'following' ? 'No reviews from people you follow' : 'No reviews yet'}
          </p>
          <p className="text-sm text-muted mb-4 max-w-sm mx-auto">
            {network === 'following'
              ? 'None of the creators or users you follow have reviewed this video yet.'
              : 'Be the first to share your thoughts and rate this video for the community.'}
          </p>
          <Link 
            href={`?logUrl=${encodeURIComponent(videoUrl)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber text-bg hover:brightness-110 transition text-sm font-bold shadow-lg shadow-amber/10"
          >
            <MessageSquare size={16} />
            Be the first to review
          </Link>
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
                  className="p-2 rounded-lg bg-surface text-ink hover:text-amber disabled:opacity-40 disabled:hover:text-ink transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className="text-xs font-mono font-semibold px-2 text-ink">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-surface text-ink hover:text-amber disabled:opacity-40 disabled:hover:text-ink transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
