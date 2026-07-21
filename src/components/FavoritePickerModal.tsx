'use client'

import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { VideoGridCard } from './VideoGridCard'

export function FavoritePickerModal({ 
  profileId, 
  position, 
  onClose 
}: { 
  profileId: string
  position: number
  onClose: () => void 
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recent')
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('ratings')
        .select('*, videos(*)')
        .eq('user_id', profileId)
        .order('updated_at', { ascending: false })
      
      if (data) {
        setVideos(data.filter(r => r.videos))
      }
      setLoading(false)
    }
    load()
  }, [profileId])

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

  async function handleSelect(videoId: string) {
    setSaving(true)
    const { error } = await supabase
      .from('profile_favourites')
      .upsert({
        profile_id: profileId,
        position,
        video_id: videoId
      }, { onConflict: 'profile_id, position' })
    
    if (!error) {
      router.refresh()
      onClose()
    } else {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-surface border border-amber rounded-2xl shadow-xl flex flex-col my-auto h-[80vh]">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <h2 className="text-lg font-display font-bold whitespace-nowrap">Pick a Favourite</h2>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              autoFocus
              className="w-full bg-bg border border-border rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-amber"
              placeholder="Search your logged videos..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-bg border border-border rounded-lg text-sm px-3 py-2 outline-none focus:border-amber cursor-pointer"
          >
            <option value="recent">Recently Logged</option>
            <option value="rating">Highest Rated</option>
            <option value="liked">Liked</option>
          </select>
          <button 
            onClick={onClose}
            className="p-2 text-muted hover:text-ink rounded-full transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
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
                      onClick={() => handleSelect(v.id)}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
