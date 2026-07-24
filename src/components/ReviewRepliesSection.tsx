'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Send, Trash2, Reply as ReplyIcon, Heart, Flag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar } from './Avatar'
import { getReviewReplies, addReviewReply, deleteReviewReply, type ReviewReply } from '@/app/actions/review-replies'
import { toggleReplyLike } from '@/app/actions/review-reply-likes'
import { ReportModal } from './ReportModal'

type Props = {
  ratingId: string
  currentUserId?: string
  currentUserProfile?: {
    username: string
    display_name?: string
    avatar_url?: string
  }
  isReplyingExternal?: boolean
  onCancelReplyingExternal?: () => void
}

export function ReviewRepliesSection({
  ratingId,
  currentUserId,
  currentUserProfile,
  isReplyingExternal,
  onCancelReplyingExternal,
}: Props) {
  const [isMounted, setIsMounted] = useState(false)
  const [replies, setReplies] = useState<ReviewReply[]>([])
  const [loading, setLoading] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Local reply input state
  const [showComposer, setShowComposer] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [parentReplyId, setParentReplyId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [reportingReply, setReportingReply] = useState<{ id: string; username?: string } | null>(null)

  // Sync external reply trigger from parent ReviewCard
  useEffect(() => {
    if (isReplyingExternal) {
      setShowComposer(true)
      setShowReplies(true)
      if (!fetched) {
        loadReplies()
      }
    }
  }, [isReplyingExternal])

  const loadReplies = async () => {
    setLoading(true)
    const res = await getReviewReplies(ratingId)
    if (res.success && res.replies) {
      setReplies(res.replies)
    }
    setFetched(true)
    setLoading(false)
  }

  const handleToggleShow = () => {
    if (!showReplies && !fetched) {
      loadReplies()
    }
    setShowReplies(prev => !prev)
  }

  const handleStartReply = (parentId?: string) => {
    setShowComposer(true)
    setShowReplies(true)
    if (parentId) {
      setParentReplyId(parentId)
    } else {
      setParentReplyId(null)
    }
  }

  const handleCancelComposer = () => {
    setShowComposer(false)
    setReplyText('')
    setParentReplyId(null)
    if (onCancelReplyingExternal) {
      onCancelReplyingExternal()
    }
  }

  const handleSubmitReply = async () => {
    if (!replyText.trim() || submitting || !currentUserId) return

    setSubmitting(true)
    const finalContent = replyText.trim()
    
    // Optimistic temp reply
    const tempReply: ReviewReply = {
      id: `temp-${Date.now()}`,
      rating_id: ratingId,
      user_id: currentUserId,
      parent_reply_id: parentReplyId,
      content: finalContent,
      created_at: new Date().toISOString(),
      like_count: 0,
      is_liked: false,
      profile: currentUserProfile ? {
        id: currentUserId,
        username: currentUserProfile.username,
        display_name: currentUserProfile.display_name,
        avatar_url: currentUserProfile.avatar_url,
      } : undefined
    }

    setReplies(prev => [...prev, tempReply])
    setReplyText('')
    setShowComposer(false)
    setParentReplyId(null)

    const res = await addReviewReply({
      ratingId,
      content: finalContent,
      parentReplyId: parentReplyId || undefined,
    })

    if (res.success && res.reply) {
      setReplies(prev => prev.map(r => r.id === tempReply.id ? res.reply! : r))
    } else {
      // Revert if failed
      setReplies(prev => prev.filter(r => r.id !== tempReply.id))
      alert(res.error || 'Failed to send reply')
    }

    setSubmitting(false)
    if (onCancelReplyingExternal) {
      onCancelReplyingExternal()
    }
  }

  const handleDeleteReply = async (replyId: string) => {
    if (deletingId) return
    setDeletingId(replyId)

    const prevReplies = [...replies]
    setReplies(prev => prev.filter(r => r.id !== replyId))

    const res = await deleteReviewReply(replyId)
    if (!res.success) {
      setReplies(prevReplies)
      alert(res.error || 'Failed to delete reply')
    }

    setDeletingId(null)
  }

  const handleToggleLike = async (replyId: string) => {
    if (!currentUserId) return

    setReplies(prev => prev.map(r => {
      if (r.id === replyId) {
        const nextLiked = !r.is_liked
        const nextCount = nextLiked ? (r.like_count || 0) + 1 : Math.max(0, (r.like_count || 0) - 1)
        return { ...r, is_liked: nextLiked, like_count: nextCount }
      }
      return r
    }))

    const res = await toggleReplyLike(replyId)
    if (!res.success) {
      // Revert on error
      loadReplies()
    }
  }

  const replyCount = replies.length

  return (
    <div className="mt-2.5 pt-2 border-t border-amber/10">
      <div className="flex items-center justify-between gap-4">
        {/* Toggle Expand Replies Button */}
        <button
          onClick={handleToggleShow}
          className="flex items-center gap-1.5 text-xs font-semibold text-amber hover:underline transition-all"
        >
          {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>
            {showReplies 
              ? 'Hide replies' 
              : replyCount > 0 
                ? `View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` 
                : 'Replies'}
          </span>
        </button>
      </div>

      {/* Inline Reply Composer */}
      {showComposer && (
        <div className="mt-2.5 flex items-start gap-2.5 bg-surface-alt/50 p-3 rounded-xl border border-amber/20 animate-fade-in">
          <Avatar
            url={currentUserProfile?.avatar_url}
            username={currentUserProfile?.username || 'user'}
            displayName={currentUserProfile?.display_name}
            className="w-7 h-7 text-[10px] shrink-0 mt-0.5"
          />
          <div className="flex-1 space-y-2">
            <textarea
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Add a reply..."
              className="w-full bg-surface border border-amber/40 rounded-lg p-2.5 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-amber transition resize-none font-normal"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelComposer}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-muted hover:text-ink transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || submitting}
                className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-bold bg-amber text-bg hover:brightness-110 disabled:opacity-50 transition shadow-sm"
              >
                <Send size={12} />
                <span>{submitting ? 'Posting...' : 'Reply'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Style Threaded Reply List */}
      {showReplies && (
        <div className="mt-2 space-y-2 pl-3 sm:pl-4 border-l-2 border-amber/20">
          {loading && replies.length === 0 && (
            <div className="text-xs text-muted py-1 font-mono animate-pulse">
              Loading replies...
            </div>
          )}

          {fetched && replies.length === 0 && !loading && (
            <div className="text-xs text-muted py-1 italic">
              No replies yet. Be the first to start the discussion!
            </div>
          )}

          {replies.map((r) => {
            const isOwner = currentUserId && r.user_id === currentUserId
            const formattedTime = (isMounted && r.created_at)
              ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true })
              : ''

            return (
              <div key={r.id} className="group relative flex items-start gap-2.5 text-xs">
                <Link href={`/u/${r.profile?.username}`} className="shrink-0">
                  <Avatar
                    url={r.profile?.avatar_url}
                    username={r.profile?.username || 'user'}
                    displayName={r.profile?.display_name}
                    className="w-7 h-7 text-[10px] hover:ring-2 hover:ring-amber transition"
                  />
                </Link>

                <div className="flex-1 min-w-0 bg-surface-alt/40 hover:bg-surface-alt/70 py-2 px-3 rounded-xl transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <Link
                        href={`/u/${r.profile?.username}`}
                        className="font-bold text-sm text-ink hover:text-amber transition-colors truncate"
                      >
                        {r.profile?.display_name || r.profile?.username || 'User'}
                      </Link>
                      {formattedTime && (
                        <span className="text-xs text-muted" suppressHydrationWarning>
                          • {formattedTime}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Reply Like Button */}
                      <button
                        onClick={() => handleToggleLike(r.id)}
                        disabled={!currentUserId}
                        title={currentUserId ? (r.is_liked ? 'Unlike reply' : 'Like reply') : 'Sign in to like'}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          r.is_liked
                            ? 'bg-rec/10 text-rec'
                            : 'bg-surface-alt/60 text-muted hover:text-ink'
                        } ${!currentUserId ? 'opacity-60 cursor-not-allowed' : ''} ${
                          r.like_count || r.is_liked ? 'opacity-100' : 'opacity-80 sm:opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Heart size={13} className={r.is_liked ? 'fill-rec text-rec' : ''} />
                        <span>{r.like_count || 0}</span>
                      </button>

                      {currentUserId && (
                        <button
                          onClick={() => handleStartReply(r.id)}
                          className="p-1 text-muted hover:text-amber transition opacity-80 sm:opacity-0 group-hover:opacity-100"
                          title="Reply to comment"
                        >
                          <ReplyIcon size={14} />
                        </button>
                      )}
                      {isOwner ? (
                        <button
                          onClick={() => handleDeleteReply(r.id)}
                          disabled={deletingId === r.id}
                          className="p-1 text-muted hover:text-rec transition opacity-80 sm:opacity-0 group-hover:opacity-100"
                          title="Delete reply"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setReportingReply({ id: r.id, username: r.profile?.username })}
                          className="p-1 text-muted hover:text-amber transition opacity-80 sm:opacity-0 group-hover:opacity-100"
                          title="Report reply"
                        >
                          <Flag size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                    {r.content}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Report Modal */}
      {reportingReply && (
        <ReportModal
          isOpen={!!reportingReply}
          onClose={() => setReportingReply(null)}
          targetType="reply"
          targetId={reportingReply.id}
          targetTitle={`Reply by @${reportingReply.username || 'user'}`}
        />
      )}
    </div>
  )
}
