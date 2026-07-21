'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, Clock } from 'lucide-react'
import { VideoGridCard } from '@/components/VideoGridCard'
import { VideoGridCardSkeleton } from '@/components/VideoGridCardSkeleton'
import { notFound } from 'next/navigation'

type Row = {
  created_at: string
  watch_status: string | null
  liked: boolean | null
  video: { id: string; title: string; channel: string; channel_thumbnail_url?: string; thumbnail_url: string; url: string }
}

import { use } from 'react'

export default function WatchlistPage(props: { params: Promise<{ username: string }> }) {
  const params = use(props.params)
  const supabase = createClient()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isOwnProfile, setIsOwnProfile] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load() {
    const { data: prof } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', params.username.toLowerCase())
      .single()

    if (!prof) {
      notFound()
      return
    }
    setProfile(prof)

    const { data: { session } } = await supabase.auth.getSession()
    setIsOwnProfile(session?.user?.id === prof.id)

    const { data } = await supabase
      .from('ratings')
      .select('*, videos(id, title, channel, thumbnail_url, url, channels(thumbnail_url))')
      .eq('user_id', prof.id)
      .eq('watch_status', 'want_to_watch')
      .order('created_at', { ascending: false })

    setRows((data || []).map((d: any) => ({
      created_at: d.created_at,
      watch_status: d.watch_status,
      liked: d.liked,
      video: {
        ...d.videos,
        channel_thumbnail_url: d.videos.channels?.thumbnail_url
      }
    })))
    setLoading(false)
  }

  async function handleDelete(videoId: string) {
    await supabase.from('ratings').delete().eq('video_id', videoId)
    setRows((r) => r?.filter((x) => x.video.id !== videoId) ?? null)
  }

  async function handleToggleLike(videoId: string, currentLiked: boolean) {
    const newLiked = !currentLiked
    setRows((r) => r?.map(x => x.video.id === videoId ? { ...x, liked: newLiked } : x) ?? null)
    
    const { error } = await supabase
      .from('ratings')
      .update({ liked: newLiked })
      .eq('video_id', videoId)
      
    if (error) {
      console.warn('Failed to save like:', error)
      setRows((r) => r?.map(x => x.video.id === videoId ? { ...x, liked: currentLiked } : x) ?? null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-display font-bold mb-6">Want to Watch</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <VideoGridCardSkeleton />
          <VideoGridCardSkeleton />
          <VideoGridCardSkeleton />
          <VideoGridCardSkeleton />
        </div>
      </div>
    )
  }

  const filteredRows = (rows || []).filter(r => {
    if (!query) return true
    const q = query.toLowerCase()
    return r.video.title.toLowerCase().includes(q) || 
           (r.video.channel && r.video.channel.toLowerCase().includes(q))
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
        <h2 className="text-xl font-display font-bold mb-1">Want to Watch</h2>
        
        {rows && rows.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              className="w-full bg-surface rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-amber"
              placeholder="Search watchlist..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        )}
      </div>
      
      {!rows || rows.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-border rounded-xl">
          <Clock className="mx-auto text-muted mb-4" size={32} />
          <h3 className="text-lg font-medium text-ink mb-2">Watchlist is empty</h3>
          <p className="text-muted mb-6">
            {isOwnProfile 
              ? "You haven't added any videos to watch later." 
              : `${profile?.display_name || profile?.username} hasn't added any videos to their watchlist.`}
          </p>
          {isOwnProfile && (
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-amber text-bg hover:brightness-110 transition"
            >
              Find something to watch
            </Link>
          )}
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="text-center py-12 text-muted bg-surface rounded-xl">
          No videos found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRows.map((r) => (
            <VideoGridCard
              key={r.video.id}
              title={r.video.title}
              channel={r.video.channel}
              channelThumbnail={r.video.channel_thumbnail_url}
              thumbnail={r.video.thumbnail_url}
              url={r.video.url}
              rating={null}
              watchStatus={r.watch_status}
              liked={!!r.liked}
              onLikeToggle={isOwnProfile ? () => handleToggleLike(r.video.id, !!r.liked) : undefined}
              markWatchedUrl={isOwnProfile ? `?logUrl=${encodeURIComponent(r.video.url)}&action=watched` : undefined}
              onDelete={isOwnProfile ? () => handleDelete(r.video.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
