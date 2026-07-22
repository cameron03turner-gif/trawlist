'use client'

import { MessageSquare, Lock, Eye, Heart, Clock, Star, Plus, X } from 'lucide-react'
import { Scrubber } from './Scrubber'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { BaseVideoCardWrapper } from './BaseVideoCard'

type Props = {
  title: string
  channel: string | null
  channelId?: string | null
  channelThumbnail?: string | null
  thumbnail: string
  url: string
  rating: number | null
  review?: string | null
  note?: string | null
  watchStatus?: string | null
  editUrl?: string
  markWatchedUrl?: string
  onDelete?: () => void
  rank?: number
  count?: number
  reviewsCount?: number
  likesCount?: number
  onClick?: () => void
  detailUrl?: string
  liked?: boolean
  onLikeToggle?: () => void
  isLogged?: boolean
  isLoggedIn?: boolean
}

export function VideoGridCard(props: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()



  const getRankBadge = (rank: number) => {
    if (rank > 10) return null
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const badgeContent = props.rank !== undefined ? getRankBadge(props.rank) : null

  const topRightOverlay = badgeContent ? (
    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md text-xs font-mono font-bold text-amber rounded-md z-10 shadow-[0_2px_8px_rgba(0,0,0,0.8)] pointer-events-none">
      {badgeContent}
    </div>
  ) : null

  const bottomLeftOverlay = null

  const hoverMenu = props.onDelete ? (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onDelete?.();
      }}
      className="absolute top-2 right-2 p-1.5 bg-bg/80 hover:bg-red-500/90 text-muted hover:text-white backdrop-blur rounded-full opacity-0 group-hover/thumb:opacity-100 transition-all z-20 shadow-sm border border-amber/50"
      title="Remove"
    >
      <X size={14} />
    </button>
  ) : null

  const middleActionSlot = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
          <div className="shrink-0">
            {props.rating != null ? (
              <Scrubber value={props.rating} interactive={false} height={12} />
            ) : props.watchStatus ? (
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted bg-surface-alt px-1.5 py-0.5 rounded flex items-center gap-1 w-fit">
                {props.watchStatus === 'want_to_watch' ? (
                  <><Clock size={10} /> Watchlist</>
                ) : (
                  <><Eye size={10} /> {props.watchStatus}</>
                )}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {props.review && (
              <div className="text-ink" title="Has public review">
                <MessageSquare size={12} />
              </div>
            )}
            {props.note && (
              <div className="text-muted" title="Has private note">
                <Lock size={12} />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 relative z-10">
          {(props.onLikeToggle !== undefined || props.liked) && (
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); props.onLikeToggle?.(); }}
              className={`transition outline-none ${
                props.liked 
                  ? 'text-rec hover:brightness-110' 
                  : 'text-muted hover:text-rec'
              } ${!props.onLikeToggle ? 'pointer-events-none cursor-default' : ''}`}
              title={props.liked ? "Liked" : "Like"}
            >
              <Heart size={13} className={props.liked ? "fill-current" : ""} />
            </button>
          )}
          {props.rating != null && (
            <div className="text-xs font-bold text-amber ml-0.5">{props.rating.toFixed(1)}</div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <div className="relative z-10">
          {props.isLoggedIn && !props.isLogged && !props.editUrl && !props.markWatchedUrl && (
            <Link
              href={`${pathname}?${new URLSearchParams({
                ...Object.fromEntries(searchParams.entries()),
                logUrl: props.url,
                status: 'want_to_watch'
              }).toString()}`}
              className="text-muted hover:text-bg hover:bg-amber rounded-full transition-colors flex items-center justify-center w-[18px] h-[18px]"
              title="Add to Watchlist"
              onClick={(e) => e.stopPropagation()}
            >
              <Plus size={16} />
            </Link>
          )}
        </div>
        {props.count !== undefined && (
          <div className="flex items-center justify-end gap-2.5 text-[10px] text-muted font-medium">
            {props.likesCount !== undefined && props.likesCount > 0 && (
              <div className="flex items-center gap-1" title={`${props.likesCount} likes`}>
                <Heart size={10} />
                <span>{props.likesCount}</span>
              </div>
            )}
            {props.reviewsCount !== undefined && props.reviewsCount > 0 && (
              <div className="flex items-center gap-1" title={`${props.reviewsCount} reviews`}>
                <MessageSquare size={10} />
                <span>{props.reviewsCount}</span>
              </div>
            )}
            <div className="flex items-center gap-1" title={`${props.count} ratings`}>
              <Star size={10} />
              <span>{props.count}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )

  return (
    <BaseVideoCardWrapper
      layout="grid"
      title={props.title}
      channel={props.channel}
      channelId={props.channelId}
      channelThumbnail={props.channelThumbnail}
      thumbnail={props.thumbnail}
      url={props.url}
      detailUrl={props.detailUrl}
      onClick={props.onClick}
      topRightOverlay={topRightOverlay}
      bottomLeftOverlay={bottomLeftOverlay}
      middleActionSlot={middleActionSlot}
      hoverMenu={hoverMenu}
    />
  )
}
