'use client'

import { useEffect, useState, Suspense } from 'react'
import { X, Heart, Star, ListPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Scrubber } from './Scrubber'
import { VideoActionPanel } from './VideoActionPanel'
import { UserLogDisplay } from './UserLogDisplay'
import { VideoReviewsList } from './VideoReviewsList'

type VideoDetailModalProps = {
  videoId: string | null
  onClose: () => void
}

export function VideoDetailModal({ videoId, onClose }: VideoDetailModalProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (!videoId) {
      setData(null)
      return
    }

    let mounted = true
    setLoading(true)

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()

      // Fetch video info & aggregated stats
      let { data: videoData } = await supabase
        .from('video_leaderboard')
        .select('*')
        .eq('id', videoId)
        .single()

      if (!videoData) {
        const { data: fallbackVideo } = await supabase
          .from('videos')
          .select('*')
          .eq('id', videoId)
          .single()
        
        if (fallbackVideo) {
          videoData = { ...fallbackVideo, avg_rating: null, rating_count: 0, review_count: 0 }
        } else {
          if (mounted) {
            setData({ error: true })
            setLoading(false)
          }
          return
        }
      }

      const { count: listsCount } = await supabase
        .from('list_items')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', videoId)

      const { data: allRatings } = await supabase
        .from('ratings')
        .select('id, user_id, rating, review, note, watch_status, liked, updated_at, profiles!ratings_user_id_fkey(username, display_name, avatar_url), review_likes(user_id)')
        .eq('video_id', videoId)
        .order('updated_at', { ascending: false })

      let followingIds: string[] = []
      if (user) {
        const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', user.id)
        followingIds = follows?.map(f => f.following_id) || []
      }

      if (!mounted) return
      setCurrentUser(user)

      let myRatingData = null
      const distribution: Record<string, number> = {}
      const reviews: any[] = []
      let likesCount = 0
      let hasRated = false

      if (allRatings) {
        allRatings.forEach((r: any) => {
          if (user && r.user_id === user.id) {
            hasRated = true
            myRatingData = {
              ...r,
              like_count: r.review_likes?.length || 0
            }
          }
          if (r.rating !== null) {
            const rStr = Number(r.rating).toFixed(1)
            distribution[rStr] = (distribution[rStr] || 0) + 1
          }
          if (r.review) {
            reviews.push({
              ...r,
              profile: r.profiles,
              like_count: r.review_likes?.length || 0,
              is_liked: user ? r.review_likes?.some((l: any) => l.user_id === user.id) : false
            })
          }
          if (r.liked) {
            likesCount++
          }
        })
      }

      setData({ video: videoData, distribution, reviews, likesCount, listsCount, followingIds, total: allRatings?.filter((r: any) => r.rating !== null).length || 0, hasRated, myRatingData })
      setLoading(false)
    }

    load()
    const handleRatingSaved = () => {
      if (mounted) load()
    }
    window.addEventListener('rating-saved', handleRatingSaved)

    return () => { 
      mounted = false
      window.removeEventListener('rating-saved', handleRatingSaved)
    }
  }, [videoId])

  if (!videoId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'var(--modal-backdrop-bg)', backdropFilter: 'blur(var(--modal-backdrop-blur))', WebkitBackdropFilter: 'blur(var(--modal-backdrop-blur))' }} onClick={onClose}>
      <div className="aero-modal relative w-full max-w-4xl bg-surface border border-amber rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.1)] flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted hover:text-amber hover:bg-surface-alt bg-bg/80 rounded-full border border-amber/20 z-10 transition-colors"
        >
          <X size={16} />
        </button>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-muted border-t-amber rounded-full animate-spin" />
          </div>
        ) : !data || data.error ? (
          <div className="p-12 flex justify-center flex-col items-center gap-4">
            <p className="text-muted">Video not found.</p>
          </div>
        ) : (
          <div className="overflow-y-auto">
            {/* Top Thumbnail */}
            <div className="w-full relative py-6 flex justify-center border-b border-border overflow-hidden bg-[#060E10]">
              <div 
                className="absolute inset-0 bg-cover bg-bottom opacity-40 mix-blend-screen" 
                style={{ backgroundImage: 'url(/water-pattern.jpg)' }} 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface" />
              <img src={data.video.thumbnail_url?.replace(/hqdefault\.jpg|mqdefault\.jpg|sddefault\.jpg/g, 'maxresdefault.jpg')} alt="" className="w-full max-w-[640px] aspect-video object-cover rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/5 relative z-10" />
            </div>

            {/* Stats Row */}
            <div className="flex justify-center gap-12 text-sm font-semibold mb-6 border-b border-border/50 py-3 bg-surface-alt/50">
              <div className="flex items-center gap-2" title={`${data.total || 0} Rated`}>
                <Star size={20} className="text-amber" />
                <span className="text-muted transition">{data.total || 0}</span>
              </div>
              <div className="flex items-center gap-2" title={`${data.listsCount || 0} Lists`}>
                <ListPlus size={20} className="text-amber" />
                <span className="text-muted transition">{data.listsCount || 0}</span>
              </div>
              <div className="flex items-center gap-2" title={`${data.likesCount || 0} Liked`}>
                <Heart size={20} className="text-rec" />
                <span className="text-muted transition">{data.likesCount || 0}</span>
              </div>
            </div>

            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <div className="relative mb-2">
                      <a href={`/videos/${videoId}`} className="block pr-12 group/title">
                        <h2 className="text-3xl font-extrabold text-ink leading-tight group-hover/title:text-amber transition-colors">{data.video.title}</h2>
                      </a>
                      {data.myRatingData?.liked && (
                        <div title="You liked this video" className="absolute top-0 right-0 mt-1 pointer-events-none">
                          <Heart size={28} className="fill-rec text-rec" />
                        </div>
                      )}
                    </div>
                    <a 
                      href={`/channel/${encodeURIComponent(data.video.channel_id || data.video.channel)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        setTimeout(() => {
                          router.push(`/channel/${encodeURIComponent(data.video.channel_id || data.video.channel)}`);
                        }, 50);
                      }}
                      className="flex items-center gap-2 group/channel min-w-0"
                    >
                      {data.video.channel_thumbnail_url && (
                        <img src={data.video.channel_thumbnail_url} alt="" className="w-6 h-6 rounded-full object-cover border border-border/50 shrink-0 group-hover/channel:border-amber transition-colors" referrerPolicy="no-referrer" />
                      )}
                      <span className="text-base font-medium text-muted group-hover/channel:text-amber transition-colors line-clamp-1">
                        {data.video.channel}
                      </span>
                    </a>
                  </div>

                  {data.myRatingData && (
                    <UserLogDisplay myRatingData={data.myRatingData} videoUrl={data.video.url} />
                  )}

                  <VideoReviewsList 
                    reviews={data.reviews} 
                    videoUrl={data.video.url} 
                    currentUserId={currentUser?.id} 
                    followingIds={data.followingIds}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <Suspense fallback={null}>
                  <VideoActionPanel 
                    videoId={videoId} 
                    videoUrl={data.video.url} 
                    title={data.video.title} 
                    initialIsOnWatchlist={data.myRatingData?.watch_status === 'want_to_watch'} 
                    initialIsLogged={!!data.myRatingData && (!!data.myRatingData.rating || !!data.myRatingData.review || !!data.myRatingData.note || data.myRatingData.watch_status === 'watched')} 
                  />
                  </Suspense>

                  {/* Stats Box */}
                  <div className="bg-surface border border-amber rounded-xl p-6 shadow-xl shadow-amber/5">
                    <div className="flex flex-col items-center mb-6">
                      <span className="font-mono font-black text-amber text-5xl mb-2">{data.video.avg_rating != null ? Number(data.video.avg_rating).toFixed(1) : '—'}</span>
                      <Scrubber value={data.video.avg_rating != null ? Number(data.video.avg_rating) : 0} interactive={false} height={18} />
                      <div className="text-xs text-muted uppercase tracking-widest font-bold mt-4">
                        {data.total} Ratings
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
