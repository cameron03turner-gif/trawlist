'use client'

import { useState, useEffect } from 'react'
import { X, Search, Link as LinkIcon, ListVideo } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { VideoGridCard } from './VideoGridCard'

type Props = {
  listId: string
  onClose: () => void
}

export function AddToListModal({ listId, onClose }: Props) {
  const router = useRouter()
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState<'log' | 'url'>('log')
  
  // Log Picker State
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recent')
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLogVideo, setSelectedLogVideo] = useState<any | null>(null)
  const [logNote, setLogNote] = useState('')
  
  // URL Input State
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch logged videos
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('ratings')
        .select('*, videos(*)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      
      if (data) {
        setVideos(data.filter(r => r.videos))
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  const filtered = videos
    .filter(r => {
      const v = r.videos
      return v.title.toLowerCase().includes(query.toLowerCase()) || 
             (v.channel && v.channel.toLowerCase().includes(query.toLowerCase()))
    })
    .sort((a, b) => {
      if (sort === 'rating') return Number(b.rating || 0) - Number(a.rating || 0)
      if (sort === 'liked') return (b.liked ? 1 : 0) - (a.liked ? 1 : 0)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

  async function handleSelectLog(video: any) {
    setSelectedLogVideo(video)
    setLogNote('')
  }

  async function handleConfirmLogSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedLogVideo) {
      await submitItem(selectedLogVideo.url, logNote)
    }
  }

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    await submitItem(url, note)
  }

  async function submitItem(videoUrl: string, itemNote: string) {
    setSaving(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl, note: itemNote })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add video')
      }

      router.refresh()
      onClose()
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-surface border border-amber rounded-2xl shadow-xl flex flex-col my-auto h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-amber/30 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <h2 className="text-lg font-display font-bold whitespace-nowrap">
              {selectedLogVideo ? 'Add Note' : 'Add to List'}
            </h2>
            
            {!selectedLogVideo && (
              <div className="aero-toggle w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('log')}
                  data-active={activeTab === 'log'}
                  className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
                >
                  <ListVideo size={14} /> From Log
                </button>
                <button
                  onClick={() => setActiveTab('url')}
                  data-active={activeTab === 'url'}
                  className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
                >
                  <LinkIcon size={14} /> Paste URL
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted hover:text-ink rounded-full transition-colors shrink-0 sm:static"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm shrink-0">
              {error}
            </div>
          )}

          {activeTab === 'log' ? (
            <div className="flex flex-col h-full">
              {selectedLogVideo ? (
                <div className="p-6 max-w-md mx-auto w-full flex-1 flex flex-col justify-center space-y-6">
                  <div className="flex gap-4 p-4 bg-bg border border-amber rounded-xl items-start">
                    <img src={selectedLogVideo.thumbnail_url} alt="" className="w-24 rounded-md object-cover aspect-video border border-amber" />
                    <div>
                      <h3 className="text-sm font-medium leading-snug line-clamp-2">{selectedLogVideo.title}</h3>
                      <p className="text-xs text-muted mt-1">{selectedLogVideo.channel}</p>
                    </div>
                  </div>

                  <form onSubmit={handleConfirmLogSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">
                        Note (optional)
                      </label>
                      <textarea
                        value={logNote}
                        onChange={(e) => setLogNote(e.target.value)}
                        className="w-full bg-bg border border-amber rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-amber resize-none h-24"
                        placeholder="Why is this video on the list?"
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedLogVideo(null)}
                        disabled={saving}
                        className="flex-1 bg-bg text-ink font-medium py-2.5 px-4 rounded-lg hover:bg-surface-alt transition disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center bg-amber text-bg font-bold py-2.5 px-4 rounded-lg hover:brightness-110 transition shadow-sm disabled:opacity-50"
                      >
                        {saving ? <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" /> : 'Add Video'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <div className="p-4 flex gap-4 shrink-0">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink z-10" size={16} />
                      <input 
                        className="w-full bg-bg border border-amber rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-amber"
                        placeholder="Search your logged videos..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                      />
                    </div>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="w-full bg-surface border border-amber rounded-xl text-sm font-medium text-ink px-4 py-2 outline-none focus:border-amber focus:ring-1 focus:ring-amber cursor-pointer transition-colors"
                    >
                      <option value="recent">Recently Logged</option>
                      <option value="rating">Highest Rated</option>
                      <option value="liked">Liked</option>
                    </select>
                  </div>

                  <div className="flex-1 p-4 pt-0 overflow-y-auto">
                    {loading ? (
                      <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-muted border-t-amber rounded-full animate-spin" /></div>
                    ) : filtered.length === 0 ? (
                      <div className="text-center p-10 text-muted">No videos found.</div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filtered.map(r => {
                          const v = r.videos
                          return (
                            <div key={v.id} className={saving ? 'opacity-50 pointer-events-none' : ''}>
                              <VideoGridCard
                                title={v.title}
                                channel={v.channel}
                                thumbnail={v.thumbnail_url}
                                url={v.url}
                                rating={r.rating}
                                liked={!!r.liked}
                                watchStatus={r.watch_status}
                                onClick={() => handleSelectLog(v)}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="p-6 max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-bg border border-amber rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-amber"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Note (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-bg border border-amber rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-amber resize-none h-24"
                    placeholder="Why is this video on the list?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || !url.trim()}
                  className="w-full flex items-center justify-center bg-amber text-bg font-bold py-2.5 px-4 rounded-lg hover:brightness-110 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" /> : 'Add Video'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
