'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ListVideo, UserCircle, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VideoGridCard } from '@/components/VideoGridCard'
import { VideoGridCardSkeleton } from '@/components/VideoGridCardSkeleton'

type Row = {
  rating: number | null
  review: string | null
  note: string | null
  watch_status: string | null
  liked: boolean | null
  updated_at: string
  video: { id: string; title: string; channel: string; channel_thumbnail_url?: string; thumbnail_url: string; url: string }
}

import { notFound } from 'next/navigation'
import { use } from 'react'

export default function LogPage(props: { params: Promise<{ username: string }> }) {
  const params = use(props.params)
  const supabase = createClient()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isOwnProfile, setIsOwnProfile] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recent')

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load() {
    // 1. Fetch Profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .eq('username', params.username.toLowerCase())
      .single()

    if (!prof) {
      notFound()
      return
    }
    setProfile(prof)

    // 2. Fetch Session
    const { data: { session } } = await supabase.auth.getSession()
    setIsOwnProfile(session?.user?.id === prof.id)

    // 3. Fetch Ratings
    const { data } = await supabase
      .from('ratings')
      .select('*, videos(id, title, channel, thumbnail_url, url, channels(thumbnail_url))')
      .eq('user_id', prof.id)
      .or('watch_status.is.null,watch_status.neq.want_to_watch')
      .order('updated_at', { ascending: false })

    setRows((data || []).map((d: any) => ({ 
      rating: d.rating, 
      review: d.review,
      note: session?.user?.id === prof.id ? d.note : null,
      watch_status: d.watch_status,
      liked: d.liked,
      updated_at: d.updated_at,
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
    // Optimistic update
    setRows((r) => r?.map(x => x.video.id === videoId ? { ...x, liked: newLiked } : x) ?? null)
    
    const { error } = await supabase
      .from('ratings')
      .update({ liked: newLiked })
      .eq('video_id', videoId)
      
    if (error) {
      // Revert if error
      console.warn('Failed to save like (did you add the `liked` column yet?):', error)
      setRows((r) => r?.map(x => x.video.id === videoId ? { ...x, liked: currentLiked } : x) ?? null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-display font-bold mb-1">Log</h2>
          <p className="text-sm text-muted">Loading ratings...</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <VideoGridCardSkeleton />
          <VideoGridCardSkeleton />
          <VideoGridCardSkeleton />
          <VideoGridCardSkeleton />
          <VideoGridCardSkeleton />
        </div>
      </div>
    )
  }

  const filteredRows = (rows || [])
    .filter(r => {
      if (!query) return true
      const q = query.toLowerCase()
      return r.video.title.toLowerCase().includes(q) || 
             (r.video.channel && r.video.channel.toLowerCase().includes(q))
    })
    .sort((a, b) => {
      if (sort === 'rating') return Number(b.rating || 0) - Number(a.rating || 0)
      if (sort === 'liked') return (b.liked ? 1 : 0) - (a.liked ? 1 : 0)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
        <div>
          <h2 className="text-xl font-display font-bold mb-1">{isOwnProfile ? 'My Log' : `${profile?.display_name || profile?.username}'s Log`}</h2>
          <p className="text-sm text-muted">Everything rated or saved.</p>
        </div>

        {rows && rows.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input 
                className="w-full bg-surface rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-amber"
                placeholder="Search log..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-surface border border-border rounded-xl text-sm font-medium text-ink px-4 py-2 outline-none focus:border-amber focus:ring-1 focus:ring-amber cursor-pointer transition-colors shrink-0"
            >
              <option value="recent">Recently Logged</option>
              <option value="rating">Highest Rated</option>
              <option value="liked">Liked</option>
            </select>
          </div>
        )}
      </div>

      {!rows || rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-surface rounded-xl">
          <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center text-muted">
            <ListVideo size={32} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Nothing logged yet</p>
            {isOwnProfile && <p className="text-sm text-muted">Paste a YouTube link on the Home page to start your log.</p>}
          </div>
          {isOwnProfile && (
            <Link href="/" className="px-4 py-2 rounded-lg text-sm font-semibold bg-amber text-bg mt-2">
              Log a Video
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
              detailUrl={`/videos/${r.video.id}`}
              rating={r.rating}
              review={r.review}
              note={r.note}
              watchStatus={r.watch_status}
              liked={!!r.liked}
              onLikeToggle={isOwnProfile ? () => handleToggleLike(r.video.id, !!r.liked) : undefined}
              editUrl={isOwnProfile ? `?logUrl=${encodeURIComponent(r.video.url)}` : undefined}
              onDelete={isOwnProfile ? () => handleDelete(r.video.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
