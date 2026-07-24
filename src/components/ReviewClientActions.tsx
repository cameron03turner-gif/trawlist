'use client'

import { useState } from 'react'
import { Heart, Share2, Flag, Check } from 'lucide-react'
import { toggleReviewLike } from '@/app/actions/review-likes'
import { ReportModal } from './ReportModal'

type Props = {
  reviewId: string
  initialLikeCount: number
  initialIsLiked: boolean
  currentUserId?: string
  isMine: boolean
  authorUsername: string
}

export function ReviewClientActions({
  reviewId,
  initialLikeCount,
  initialIsLiked,
  currentUserId,
  isMine,
  authorUsername,
}: Props) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiking, setIsLiking] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleToggleLike = async () => {
    if (!currentUserId || isLiking) return

    const nextIsLiked = !isLiked
    const nextLikeCount = nextIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1)

    setIsLiked(nextIsLiked)
    setLikeCount(nextLikeCount)
    setIsLiking(true)

    const res = await toggleReviewLike(reviewId)
    if (!res.success) {
      setIsLiked(!nextIsLiked)
      setLikeCount(likeCount)
    }
    setIsLiking(false)
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Like Button */}
        <button
          onClick={handleToggleLike}
          disabled={!currentUserId || isLiking}
          title={currentUserId ? (isLiked ? 'Unlike review' : 'Like review') : 'Sign in to like reviews'}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isLiked
              ? 'bg-rec/15 text-rec border border-rec/30'
              : 'bg-surface-alt/60 border border-amber/30 text-muted hover:text-ink hover:border-amber'
          } ${!currentUserId ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Heart size={15} className={isLiked ? 'fill-rec text-rec' : ''} />
          <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          title="Share review link"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber/15 text-amber border border-amber/40 hover:bg-amber hover:text-bg transition-all shadow-sm cursor-pointer"
        >
          {copied ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>

        {/* Flag / Report Button */}
        <button
          onClick={() => {
            if (isMine) return
            setIsReportOpen(true)
          }}
          disabled={isMine}
          title={isMine ? "You cannot report your own review" : "Report review"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isMine
              ? 'opacity-30 cursor-not-allowed text-muted bg-surface-alt/20 border border-amber/10'
              : 'bg-surface-alt/40 border border-amber/20 text-muted hover:text-amber cursor-pointer'
          }`}
        >
          <Flag size={14} />
          <span>Report</span>
        </button>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="review"
        targetId={reviewId}
        targetTitle={`Review by @${authorUsername}`}
      />
    </>
  )
}
