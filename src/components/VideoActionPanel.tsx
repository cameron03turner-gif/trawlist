'use client'

import { Youtube, Clock, Plus, Share, ListPlus, X, LogIn, Check, Flag } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ShareButton } from './ShareButton'
import { SaveToListModal } from './SaveToListModal'
import { ReportModal } from './ReportModal'
import { toggleWatchlist, removeLog } from '@/app/actions/ratings'

type Props = {
  videoId: string
  videoUrl: string
  title: string
  initialIsOnWatchlist?: boolean
  initialIsLogged?: boolean
  isLoggedIn?: boolean
}

export function VideoActionPanel({ videoId, videoUrl, title, initialIsOnWatchlist = false, initialIsLogged = false, isLoggedIn = false }: Props) {
  const [isOnWatchlist, setIsOnWatchlist] = useState(initialIsOnWatchlist)
  const [isLogged, setIsLogged] = useState(initialIsLogged)
  const [isPending, setIsPending] = useState(false)
  const [isRemovingLog, setIsRemovingLog] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsLogged(initialIsLogged)
  }, [initialIsLogged])

  useEffect(() => {
    setIsOnWatchlist(initialIsOnWatchlist)
  }, [initialIsOnWatchlist])

  const handleOpenLogModal = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('logUrl', videoUrl)
    window.history.pushState(null, '', `?${params.toString()}`)
  }
  
  const handleToggleWatchlist = async () => {
    const nextState = !isOnWatchlist
    setIsOnWatchlist(nextState) // Optimistic
    setIsPending(true)
    const res = await toggleWatchlist(videoUrl)
    if (res.error) {
      setIsOnWatchlist(!nextState) // Revert on error
    } else {
      setIsOnWatchlist(res.isOnWatchlist || false)
    }
    setIsPending(false)
  }

  const handleRemoveLog = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsLogged(false) // Optimistic
    setIsRemovingLog(true)
    const res = await removeLog(videoUrl)
    if (res.error) {
      console.error('Error removing log:', res.error)
      setIsLogged(true) // Revert on error
    } else {
      router.refresh()
    }
    setIsRemovingLog(false)
  }

  return (
    <>
    <div className="bg-surface rounded-2xl border border-amber p-5 shadow-xl flex flex-col gap-5">
      {/* Primary Action */}
      {isLoggedIn ? (
        isLogged ? (
          <button 
            onClick={handleRemoveLog}
            disabled={isRemovingLog}
            className="group w-full bg-amber text-bg py-3.5 rounded-full font-bold text-center hover:brightness-110 transition shadow-lg shadow-amber/20 flex items-center justify-center gap-2"
          >
            <Check size={20} className="group-hover:hidden" />
            <X size={20} className="hidden group-hover:block" />
            <span className="block group-hover:hidden">Already logged</span>
            <span className="hidden group-hover:block">Remove from log</span>
          </button>
        ) : (
          <button 
            onClick={handleOpenLogModal}
            className="w-full bg-amber text-bg py-3.5 rounded-full font-bold text-center hover:brightness-110 transition shadow-lg shadow-amber/20 flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Log or Review
          </button>
        )
      ) : (
        <Link
          href="/login"
          className="w-full bg-amber text-bg py-3.5 rounded-full font-bold text-center hover:brightness-110 transition shadow-lg shadow-amber/20 flex items-center justify-center gap-2"
        >
          <LogIn size={20} /> Sign in to Log/Review
        </Link>
      )}

      {/* Secondary Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <a 
          href={videoUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-muted hover:text-amber hover:bg-amber/10 rounded-xl transition group"
        >
          <Youtube size={16} className="group-hover:text-amber transition" /> Watch on YouTube
        </a>
        {isLoggedIn && !isLogged && (
          <button 
            onClick={handleToggleWatchlist}
            disabled={isPending}
            className={`group flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold rounded-xl transition ${
              isOnWatchlist ? 'text-amber bg-amber/10 hover:bg-red-500/10 hover:text-red-500' : 'text-muted hover:text-amber hover:bg-amber/10'
            }`}
          >
            {isOnWatchlist ? (
              <>
                <Clock size={16} className="fill-current block group-hover:hidden" />
                <X size={16} className="hidden group-hover:block" />
                <span className="block group-hover:hidden">On Watchlist</span>
                <span className="hidden group-hover:block">Remove from Watchlist</span>
              </>
            ) : (
              <>
                <Clock size={16} />
                <span>Add to Watchlist</span>
              </>
            )}
          </button>
        )}
        {isLoggedIn ? (
          <button 
            onClick={() => setShowSaveModal(true)}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-muted hover:text-amber hover:bg-amber/10 rounded-xl transition"
          >
            <ListPlus size={16} /> Add to lists...
          </button>
        ) : (
          <Link 
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-muted hover:text-amber hover:bg-amber/10 rounded-xl transition"
          >
            <LogIn size={16} /> Sign in to add to lists...
          </Link>
        )}
        <ShareButton 
          title={title}
          text={`Check out ${title} on Trawlist!`}
          url={`/videos/${videoId}`} 
          className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-muted hover:text-amber hover:bg-amber/10 rounded-xl transition"
        >
          <Share size={16} /> Share Video
        </ShareButton>

        <button 
          onClick={() => setShowReportModal(true)}
          className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-muted hover:text-amber hover:bg-amber/10 rounded-xl transition cursor-pointer"
        >
          <Flag size={16} /> Report Video
        </button>
      </div>
    </div>
    
    {showSaveModal && (
      <SaveToListModal 
        videoUrl={videoUrl}
        onClose={() => setShowSaveModal(false)}
      />
    )}

    <ReportModal
      isOpen={showReportModal}
      onClose={() => setShowReportModal(false)}
      targetType="video"
      targetId={videoId}
      targetTitle={title}
    />
    </>
  )
}
