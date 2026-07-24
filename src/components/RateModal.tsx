'use client'

import { useState, Suspense, useEffect, useCallback } from 'react'
import { Link as LinkIcon, Loader2, PartyPopper, MessageSquare, Lock, X, Heart } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Scrubber } from '@/components/Scrubber'
import { extractVideoId } from '@/lib/youtube'
import { createClient } from '@/lib/supabase/client'

type Preview = { videoId: string; title: string; author: string; thumbnail: string; url: string; channelThumbnail?: string }

export function RateModal({ onClose }: { onClose?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isOnboarded = searchParams.get('onboarded') === 'true'

  function handleClose() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('log')
    params.delete('logUrl')
    params.delete('status')
    params.delete('action')
    params.delete('onboarded')
    const qs = params.toString()
    const targetUrl = `${pathname}${qs ? `?${qs}` : ''}`
    
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', targetUrl)
    }
    if (onClose) {
      onClose()
    }
  }

  const [urlInput, setUrlInput] = useState('')
  const [preview, setPreview] = useState<Preview | null>(null)
  const [rating, setRating] = useState<number | null>(2.5)
  const [watchStatus, setWatchStatus] = useState<'watched' | 'want_to_watch'>('watched')
  const [review, setReview] = useState('')
  const [note, setNote] = useState('')
  const [liked, setLiked] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [showNote, setShowNote] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const supabase = createClient()

  const handleFind = useCallback(async (overrideUrl?: string) => {
    const targetUrl = typeof overrideUrl === 'string' ? overrideUrl : urlInput
    const id = extractVideoId(targetUrl)
    if (!id) {
      setError("That doesn't look like a YouTube link. Paste a full URL or an 11-character video ID.")
      return
    }
    setLoading(true)
    setError('')
    setPreview(null)
    setStatus('idle')
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(
          `https://www.youtube.com/watch?v=${id}`
        )}&format=json`
      )
      if (!res.ok) throw new Error()
      const data = await res.json()

      const { data: dbVideo } = await supabase
        .from('videos')
        .select('channel_thumbnail_url')
        .eq('id', id)
        .maybeSingle()

      setPreview({
        videoId: id,
        title: data.title,
        author: data.author_name,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${id}`,
        channelThumbnail: dbVideo?.channel_thumbnail_url || undefined,
      })
      
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: existing } = await supabase
          .from('ratings')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('video_id', id)
          .single()
          
        if (existing) {
          const forceWatched = searchParams.get('action') === 'watched'
          setRating(existing.rating)
          setWatchStatus(forceWatched ? 'watched' : (existing.watch_status || 'watched'))
          setReview(existing.review || '')
          setNote(existing.note || '')
          setLiked(!!existing.liked)
          setShowReview(!!existing.review)
          setShowNote(!!existing.note)
        } else {
          const defaultStatus = (searchParams.get('status') as any) || 'watched'
          setRating(defaultStatus === 'want_to_watch' ? null : 2.5)
          setWatchStatus(defaultStatus)
          setReview('')
          setNote('')
          setLiked(false)
          setShowReview(false)
          setShowNote(false)
        }
      } else {
        setRating(2.5)
      }
    } catch {
      setError("Couldn't find that video. Double check the link and try again.")
    }
    setLoading(false)
  }, [urlInput, supabase])

  useEffect(() => {
    const url = searchParams.get('logUrl')
    if (url && !preview && !loading && status === 'idle') {
      setUrlInput(url)
      handleFind(url)
    }
  }, [searchParams, handleFind, preview, loading, status])

  async function handleSave() {
    if (!preview) return
    
    if (watchStatus === 'watched' && rating === null) {
      setError("Please provide a rating if you've watched the video.")
      return
    }

    setStatus('saving')
    setError('')
    const res = await fetch('/api/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        url: preview.url, 
        rating: watchStatus === 'want_to_watch' ? null : rating,
        review: showReview ? review : null,
        note: showNote ? note : null,
        watch_status: watchStatus === 'watched' ? null : watchStatus,
        liked
      }),
    })
    if (res.ok) {
      setStatus('saved')
      router.refresh()
      window.dispatchEvent(new Event('rating-saved'))
      setTimeout(() => {
        setStatus('idle')
        handleClose()
      }, 1500)
    } else {
      const body = await res.json().catch(() => ({}))
      setError(body.error === 'Not signed in' ? 'Sign in to save a rating.' : body.error || 'Something went wrong.')
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto" onClick={handleClose}>
      {/* Fading Backdrop Overlay */}
      <div 
        className="absolute inset-0 animate-fade-in" 
        style={{ 
          backgroundColor: 'var(--modal-backdrop-bg)', 
          backdropFilter: 'blur(var(--modal-backdrop-blur))', 
          WebkitBackdropFilter: 'blur(var(--modal-backdrop-blur))' 
        }} 
      />

      {/* Fading & Scaling Modal Container */}
      <div className="aero-modal relative w-full max-w-lg bg-surface border border-amber/30 rounded-2xl shadow-xl flex flex-col my-auto animate-fade-in-zoom z-10" onClick={e => e.stopPropagation()}>
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-muted hover:text-amber hover:bg-surface-alt bg-bg/80 rounded-full z-10 transition-colors"
          title="Close"
        >
          <X size={16} />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {!preview ? (
            <div className="text-center pt-2 pb-2">
              <h2 className="text-2xl font-display font-black text-ink mb-2">
                {isOnboarded ? 'Rate your first video' : 'Log a video'}
              </h2>
              <p className="text-sm text-muted">
                Paste a YouTube link to fetch the video details.
              </p>
            </div>
          ) : (
            <h2 className="text-xl font-display font-bold">Log a video</h2>
          )}

          {isOnboarded && !preview && (
            <div className="bg-amber/10 border border-amber/20 text-amber-900 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center shrink-0">
                <PartyPopper size={20} className="text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-950 text-sm">Profile created!</h3>
                <p className="text-sm">Welcome to Trawlist. Rate your first video by pasting a link below.</p>
              </div>
            </div>
          )}

          {!preview && (
            <div className="relative">
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFind()}
                placeholder="youtube.com/watch?v=..."
                className="w-full bg-bg border border-amber rounded-xl py-4 px-4 pr-32 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber/50 transition-all shadow-inner"
              />
              <div className="absolute inset-y-2 right-2">
                <button
                  onClick={() => handleFind()}
                  disabled={loading || !urlInput}
                  className="h-full px-6 rounded-lg text-sm font-semibold bg-amber text-bg flex items-center justify-center disabled:opacity-50 hover:brightness-110 transition-all shadow-md"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Find'}
                </button>
              </div>
            </div>
          )}

          {error && <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">{error}</div>}

      {preview && (
        <div className="rounded-xl p-4 space-y-4 bg-surface">
          <div className="flex gap-3.5 items-center">
            <img
              src={preview.thumbnail}
              alt=""
              className="w-[140px] h-[79px] object-cover rounded-lg border border-amber flex-shrink-0"
            />
            <div className="min-w-0 flex flex-col justify-center">
              <div className="text-base font-bold mb-1.5 leading-snug text-ink">{preview.title}</div>
              <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                {preview.channelThumbnail ? (
                  <img 
                    src={preview.channelThumbnail} 
                    alt="" 
                    className="w-6 h-6 rounded-full object-cover shrink-0 shadow-sm" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber/20 border border-amber/40 flex items-center justify-center text-amber text-xs font-bold shrink-0">
                    {preview.author?.[0]?.toUpperCase() || 'C'}
                  </div>
                )}
                <span className="line-clamp-1">{preview.author}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {watchStatus === 'watched' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-muted">Your rating</span>
                  <div className="flex gap-3 items-center">
                    <button 
                      onClick={() => setLiked(!liked)} 
                      className="p-1 text-muted hover:text-rec transition-colors outline-none"
                      title={liked ? "Unlike" : "Like"}
                    >
                      <Heart size={16} className={liked ? "fill-current text-rec" : ""} />
                    </button>
                    <span className="font-mono text-lg font-bold text-amber">{rating !== null ? rating.toFixed(1) : '--'}</span>
                  </div>
                </div>
                <Scrubber value={rating} onChange={setRating} />
              </div>
            )}

            <div className="flex gap-2">
              <select 
                className="bg-surface border border-amber rounded-xl text-sm font-medium text-ink px-4 py-2 outline-none focus:border-amber focus:ring-1 focus:ring-amber cursor-pointer transition-colors flex-1"
                value={watchStatus}
                onChange={e => setWatchStatus(e.target.value as any)}
              >
                <option value="watched">Watched</option>
                <option value="want_to_watch">Want to Watch</option>
              </select>

              {!showReview && (
                <button onClick={() => setShowReview(true)} className="px-3 py-2 bg-bg rounded-lg text-sm font-medium hover:bg-surface-alt transition flex items-center gap-1.5 text-muted hover:text-ink shrink-0">
                  <MessageSquare size={14} /> Review
                </button>
              )}
              {!showNote && (
                <button onClick={() => setShowNote(true)} className="px-3 py-2 bg-bg rounded-lg text-sm font-medium hover:bg-surface-alt transition flex items-center gap-1.5 text-muted hover:text-ink shrink-0">
                  <Lock size={14} /> Note
                </button>
              )}
            </div>

            {showReview && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">Public Review</label>
                  <button 
                    onClick={() => { setShowReview(false); setReview(''); }} 
                    className="text-xs text-muted hover:text-rec flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-rec/10 transition-colors font-medium"
                    title="Remove review"
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
                <textarea 
                  value={review} onChange={e => setReview(e.target.value)}
                  className="w-full bg-bg border border-amber rounded-lg p-3 text-sm outline-none focus:border-amber min-h-[80px]"
                  placeholder="What did you think of it?"
                />
              </div>
            )}

            {showNote && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1"><Lock size={12}/> Private Note</label>
                  <button 
                    onClick={() => { setShowNote(false); setNote(''); }} 
                    className="text-xs text-muted hover:text-rec flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-rec/10 transition-colors font-medium"
                    title="Remove note"
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
                <textarea 
                  value={note} onChange={e => setNote(e.target.value)}
                  className="w-full bg-bg border border-amber rounded-lg p-3 text-sm outline-none focus:border-amber min-h-[80px]"
                  placeholder="Personal thoughts, context, etc..."
                />
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-amber text-bg"
          >
            {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved to your log ✓' : 'Save rating'}
          </button>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}
