import { MessageSquare, Lock, Eye, ExternalLink, Circle } from 'lucide-react'
import Link from 'next/link'
import { Scrubber } from './Scrubber'

import { BaseVideoCardWrapper } from './BaseVideoCard'

type BaseProps = {
  title: string
  channel: string | null
  channelId?: string | null
  channelThumbnail?: string | null
  thumbnail: string
  url: string
  detailUrl?: string
  rank?: number
  onDelete?: () => void
  editUrl?: string
  review?: string | null
  reviewId?: string | null
  note?: string | null
  watchStatus?: string | null
  onClick?: () => void
}

type Props = BaseProps & ({ avg: number | null; count: number } | { rating: number | null })

const STATUS_LABELS: Record<string, string> = {
  want_to_watch: 'Want to Watch',
  watching: 'Watching',
  dropped: 'Dropped'
}

export function VideoRow(props: Props) {
  const value = 'avg' in props ? props.avg : props.rating
  const count = 'count' in props ? props.count : undefined

  const leftActionSlot = props.rank !== undefined ? (
    <div className="w-7 text-right text-sm font-mono text-muted flex-shrink-0 relative z-10 pointer-events-none">
      {String(props.rank).padStart(2, '0')}
    </div>
  ) : null

  const rightActionSlot = (
    <>
      <div className="flex-shrink-0 text-right font-mono relative z-10 pointer-events-none">
        {value !== null ? (
          <div className="text-sm font-bold text-amber">{value.toFixed(1)}</div>
        ) : (
          <div className="text-sm font-bold text-muted">--</div>
        )}
        {count !== undefined && (
          <div className="text-[10px] text-muted">{count} {count === 1 ? 'rating' : 'ratings'}</div>
        )}
      </div>
    </>
  )

  const middleActionSlot = (
    <div className="pointer-events-auto flex items-center gap-2">
      {value !== null ? (
        <Scrubber value={value} interactive={false} height={14} />
      ) : props.watchStatus ? (
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted bg-surface-alt px-1.5 py-0.5 rounded flex items-center gap-1">
          <Eye size={10} /> {STATUS_LABELS[props.watchStatus] || props.watchStatus}
        </span>
      ) : null}
    </div>
  )

  const bottomContentSlot = (props.review || props.note) ? (
    <div className="space-y-2">
      {props.review && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
              <MessageSquare size={12} className="inline mr-1.5 text-muted -mt-0.5" />
              {props.review}
            </div>
            {props.reviewId && (
              <a
                href={`/reviews/${props.reviewId}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.location.href = `${window.location.origin}/reviews/${props.reviewId}`
                }}
                title="View Full Review Page"
                className="w-7 h-7 rounded-full bg-amber/15 text-amber border border-amber/40 hover:bg-amber hover:text-bg transition-all flex items-center justify-center shadow-sm shrink-0 ml-2 relative z-10 pointer-events-auto"
              >
                <Circle size={14} />
              </a>
            )}
          </div>
        </div>
      )}
      {props.note && (
        <div className="text-xs text-muted leading-relaxed whitespace-pre-wrap bg-surface-alt/50 p-2 rounded/50">
          <Lock size={10} className="inline mr-1.5 -mt-0.5" />
          {props.note}
        </div>
      )}
    </div>
  ) : null

  return (
    <BaseVideoCardWrapper
      layout="row"
      title={props.title}
      channel={props.channel}
      channelId={props.channelId}
      channelThumbnail={props.channelThumbnail}
      thumbnail={props.thumbnail}
      url={props.url}
      detailUrl={props.detailUrl}
      onClick={props.onClick}
      leftActionSlot={leftActionSlot}
      rightActionSlot={rightActionSlot}
      middleActionSlot={middleActionSlot}
      bottomContentSlot={bottomContentSlot}
    />
  )
}
