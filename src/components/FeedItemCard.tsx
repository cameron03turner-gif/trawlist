'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, MessageSquare, Plus, ListVideo, Eye, Flag, ExternalLink, Circle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { BaseVideoCardWrapper } from './BaseVideoCard'
import { ListCard } from './ListCard'
import { Avatar } from './Avatar'
import { ReportModal } from './ReportModal'

type Props = {
  item: any
}

export function FeedItemCard({ item }: Props) {
  const [isMounted, setIsMounted] = useState(false)
  const { type, user, data, timestamp } = item
  const timeAgo = (isMounted && timestamp) ? (() => {
    try {
      const d = new Date(timestamp)
      return isNaN(d.getTime()) ? '' : formatDistanceToNow(d, { addSuffix: true })
    } catch {
      return ''
    }
  })() : ''
  const [isReportOpen, setIsReportOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (type === 'rating') {
    const { rating, review, watch_status, video } = data || {}
    if (!user || !video) return null
    if (rating === null && (!review || !review.trim()) && !watch_status) return null

    let actionText = 'rated a video'
    if (rating === null) {
      if (watch_status === 'want_to_watch') actionText = 'wants to watch'
      else if (watch_status === 'watching') actionText = 'is watching'
      else if (watch_status === 'dropped') actionText = 'dropped'
      else if (watch_status === 'watched') actionText = 'watched a video'
      else if (review) actionText = 'reviewed a video'
    }

    return (
      <div className="bg-surface border border-amber rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-amber/10 transition-all duration-300 hover:scale-[1.02] hover:brightness-110">
        <div className="p-4 flex items-center justify-between bg-surface/50">
          <div className="flex items-center space-x-3">
            <Link href={`/u/${user.username}`}>
              <Avatar 
                url={user.avatar_url} 
                username={user.username} 
                displayName={user.display_name} 
                className="w-10 h-10 hover:ring-2 hover:ring-amber transition-all text-lg" 
              />
            </Link>
            <div>
              <Link href={`/u/${user.username}`} className="font-semibold text-ink hover:text-amber">
                {user.display_name || user.username}
              </Link>
              <span className="text-muted ml-1.5 text-sm">{actionText}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{timeAgo}</span>
            <button
              onClick={() => setIsReportOpen(true)}
              title="Report content"
              className="text-muted hover:text-amber transition-colors p-1"
            >
              <Flag size={14} />
            </button>
          </div>
        </div>

        <div className="p-4">
          <BaseVideoCardWrapper
            layout="grid"
            title={video.title}
            channel={video.channel}
            channelThumbnail={video.channel_thumbnail_url}
            thumbnail={video.thumbnail_url}
            url={video.url || `https://www.youtube.com/watch?v=${video.id}`}
            detailUrl={`/videos/${video.id}`}
          />
        </div>

        {(rating !== null || review) && (
          <div className="p-5 bg-bg/30 border-t border-amber/30">
            <div className="flex items-center justify-between mb-3">
              {rating !== null ? (
                <div className="flex items-center text-amber bg-amber/10 px-2 py-1 rounded">
                  <Star fill="currentColor" size={16} className="mr-1.5" />
                  <span className="font-bold">{rating}</span>
                  <span className="text-muted ml-1">/ 5</span>
                </div>
              ) : <div />}
              
              {data?.id && (
                <Link
                  href={`/reviews/${data.id}`}
                  title="View Full Review Page"
                  className="w-7 h-7 rounded-full bg-amber/15 text-amber border border-amber/40 hover:bg-amber hover:text-bg transition-all flex items-center justify-center shadow-sm shrink-0"
                >
                  <Circle size={14} />
                </Link>
              )}
            </div>
            
            {review && (
              <div className="text-ink text-sm italic leading-relaxed border-l-2 border-amber/30 pl-4 mt-2">
                "{review}"
              </div>
            )}
          </div>
        )}

        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          targetType="review"
          targetId={data.id || user.username}
          targetTitle={`Review by @${user.username}`}
        />
      </div>
    )
  }

  if (type === 'list_created') {
    if (!user || !data || !data.id || data.is_private) return null
    const { title, description, is_ranked, id, is_private, items, items_count } = data
    return (
      <div className="bg-surface border border-amber rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-amber/10 transition-all duration-300 hover:scale-[1.02] hover:brightness-110">
        <div className="p-4 flex items-center justify-between bg-surface/50">
          <div className="flex items-center space-x-3">
            <Link href={`/u/${user.username}`}>
              <Avatar 
                url={user.avatar_url} 
                username={user.username} 
                displayName={user.display_name} 
                className="w-10 h-10 hover:ring-2 hover:ring-amber transition-all text-lg" 
              />
            </Link>
            <div>
              <Link href={`/u/${user.username}`} className="font-semibold text-ink hover:text-amber">
                {user.display_name || user.username}
              </Link>
              <span className="text-muted ml-1.5 text-sm">created a new list</span>
            </div>
          </div>
          <span className="text-xs text-muted">{timeAgo}</span>
        </div>
        <div className="p-4">
          <ListCard 
            list={{ 
              id, 
              title, 
              description, 
              is_private: is_private || false, 
              is_ranked,
              items,
              items_count
            }} 
          />
        </div>
      </div>
    )
  }

  return null
}
