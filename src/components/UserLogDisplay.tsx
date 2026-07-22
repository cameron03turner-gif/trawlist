'use client'

import { useState } from 'react'
import { Scrubber } from './Scrubber'
import { Heart, Clock, Edit2 } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type Props = {
  myRatingData: any
  videoUrl: string
}

function UserLogDisplayContent({ myRatingData, videoUrl }: Props) {
  const [showNotes, setShowNotes] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (!myRatingData || (!myRatingData.rating && !myRatingData.review && !myRatingData.note)) {
    return null
  }

  const handleEdit = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('logUrl', videoUrl)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-surface rounded-xl p-4 shadow-lg relative !overflow-visible">
      <div className="absolute top-0 right-4 -translate-y-1/2">
        <span className="inline-block text-[10px] font-black text-amber uppercase tracking-widest bg-[#091D24] px-3 py-1 rounded-full shadow-sm">
          Your Log
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-bg/50 px-4 py-2 rounded-lg">
            <span className="font-mono font-bold text-amber text-xl leading-none">{myRatingData.rating ? Number(myRatingData.rating).toFixed(1) : '-.-'}</span>
            <Scrubber value={myRatingData.rating ? Number(myRatingData.rating) : 0} interactive={false} height={14} />
          </div>
          {myRatingData.liked && (
            <div title="Liked"><Heart size={20} className="fill-rec text-rec" /></div>
          )}
          {myRatingData.watch_status === 'want_to_watch' && (
            <div title="On Watchlist"><Clock size={20} className="fill-amber text-amber" /></div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-muted uppercase tracking-wider">
            {myRatingData.updated_at ? new Date(myRatingData.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
          </span>
          <button 
            onClick={handleEdit}
            className="p-2 text-muted hover:text-amber hover:bg-amber/10 rounded-lg transition"
            title="Edit Log"
          >
            <Edit2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {myRatingData.review && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Review</span>
              {myRatingData.like_count !== undefined && (
                <div 
                  className="flex items-center gap-1.5 text-xs text-rec font-semibold bg-rec/10 px-2 py-0.5 rounded shadow-sm" 
                  title={`${myRatingData.like_count || 0} ${myRatingData.like_count === 1 ? 'person liked' : 'people liked'} your review`}
                >
                  <Heart size={12} className="fill-rec text-rec" />
                  <span>{myRatingData.like_count || 0}</span>
                </div>
              )}
            </div>
            <div>
              <p className={`text-sm text-ink leading-relaxed whitespace-pre-wrap ${expanded ? '' : 'line-clamp-3'}`}>
                {myRatingData.review}
              </p>
              {myRatingData.review.length > 200 && (
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs font-bold text-amber hover:text-amber/80 transition mt-1"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          </div>
        )}
        
        {myRatingData.note && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
                Private Note <span className="text-[9px] text-muted/60 normal-case tracking-normal bg-surface-alt px-1.5 py-0.5 rounded">Only you</span>
              </span>
              <button 
                onClick={() => setShowNotes(!showNotes)}
                className="text-[10px] font-bold text-amber hover:text-amber/80 transition uppercase tracking-widest bg-amber/10 px-2.5 py-1 rounded-md"
              >
                {showNotes ? 'Hide Note' : 'Show Note'}
              </button>
            </div>
            {showNotes && (
              <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap italic bg-surface-alt/50 p-3 rounded-lg mt-2">
                {myRatingData.note}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function UserLogDisplay({ myRatingData, videoUrl }: Props) {
  return (
    <Suspense fallback={null}>
      <UserLogDisplayContent myRatingData={myRatingData} videoUrl={videoUrl} />
    </Suspense>
  )
}
