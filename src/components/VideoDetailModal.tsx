'use client'

import { useEffect, useState, Suspense } from 'react'
import { X, Heart, Star, ListPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cleanVideoTitle } from '@/lib/youtube'
import { Scrubber } from './Scrubber'
import { VideoActionPanel } from './VideoActionPanel'
import { UserLogDisplay } from './UserLogDisplay'
import { VideoReviewsList } from './VideoReviewsList'

type VideoDetailModalProps = {
  videoId: string | null
  onClose: () => void
}

export function VideoDetailModal({ videoId, onClose }: VideoDetailModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    let mounted = true
    setImgLoaded(false)
    async function load() {
      if (!videoId) {
        setData(null)
        setLoading(false)
        return
      }

      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (mounted) setCurrentUser(user)

      // Fetch video
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*, channels(thumbnail_url)')
        .eq('id', videoId)
        .single()

      if (videoError || !videoData) {
        if (mounted) {
          setData({ error: true })
          setLoading(false)
        }
        return
      }

      if (videoData.title) {
        videoData.title = cleanVideoTitle(videoData.title)
      }

      if (videoData.channels) {
        videoData.channel_thumbnail_url = videoData.channels.thumbnail_url
      }

      // Fetch lists count from list_items
      const { count: listsCount } = await supabase
        .from('list_items')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', videoId)

      // Fetch following user IDs if logged in
      let followingIds: string[] = []
      if (user) {
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
        if (follows) {
          followingIds = follows.map((f: any) => f.following_id)
        }
      }

      // Fetch current user's rating for this video
      let hasRated = false
      let myRatingData: any = null
      if (user) {
        const { data: myRating } = await supabase
          .from('ratings')
          .select('*')
          .eq('user_id', user.id)
          .eq('video_id', videoId)
          .maybeSingle()
        if (myRating) {
          hasRated = true
          myRatingData = myRating
        }
      }

      // Fetch all ratings for stats & reviews
      let allRatings: any[] | null = null
      const { data: primaryRatings, error: ratingsError } = await supabase
        .from('ratings')
        .select('*, profile:profiles!ratings_user_id_fkey(username, display_name, avatar_url), review_replies(count)')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false })

      if (ratingsError) {
        const { data: altRatings } = await supabase
          .from('ratings')
          .select('*, profile:user_id(username, display_name, avatar_url), review_replies(count)')
          .eq('video_id', videoId)
          .order('created_at', { ascending: false })
        allRatings = altRatings
      } else {
        allRatings = primaryRatings
      }

      // Fetch review likes count safely
      let reviewLikesMap: Record<string, number> = {}
      let userLikedReviews: Set<string> = new Set()
      
      const { data: likesData } = await supabase
        .from('review_likes')
        .select('review_id, user_id')

      if (likesData) {
        likesData.forEach((l: any) => {
          reviewLikesMap[l.review_id] = (reviewLikesMap[l.review_id] || 0) + 1
          if (user && l.user_id === user.id) {
            userLikedReviews.add(l.review_id)
          }
        })
      }

      const distribution: Record<string, number> = {}
      const reviews: any[] = []
      let likesCount = 0
      let ratingSum = 0
      let totalStarRatings = 0

      if (allRatings) {
        allRatings.forEach((r: any) => {
          if (r.rating != null && !isNaN(Number(r.rating))) {
            const numR = Number(r.rating)
            ratingSum += numR
            totalStarRatings++
            const rStr = numR.toFixed(1)
            distribution[rStr] = (distribution[rStr] || 0) + 1
          }
          if (r.review) {
            reviews.push({
              ...r,
              profile: r.profile || r.profiles,
              like_count: reviewLikesMap[r.id] || 0,
              is_liked: userLikedReviews.has(r.id)
            })
          }
          if (r.liked) {
            likesCount++
          }
        })
      }

      const calculatedAvg = totalStarRatings > 0 ? (ratingSum / totalStarRatings) : null
      const computedAvgRating = calculatedAvg !== null ? calculatedAvg : (videoData?.avg_rating != null ? Number(videoData.avg_rating) : null)

      if (mounted) {
        setData({ 
          video: { ...videoData, computedAvgRating }, 
          distribution, 
          reviews, 
          likesCount, 
          listsCount, 
          followingIds, 
          total: totalStarRatings, 
          hasRated, 
          myRatingData 
        })
        setLoading(false)
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Fading Backdrop Overlay */}
      <div 
        className="absolute inset-0 animate-fade-in" 
        style={{ 
          backgroundColor: 'var(--modal-backdrop-bg)', 
          backdropFilter: 'blur(var(--modal-backdrop-blur))', 
          WebkitBackdropFilter: 'blur(var(--modal-backdrop-blur))' 
        }} 
      />
      {loading ? (
        <div className="relative z-10 flex flex-col items-center justify-center animate-pulse">
          <div className="w-12 h-12 border-4 border-amber/20 border-t-amber rounded-full animate-spin" />
        </div>
      ) : (
        /* Fading & Scaling Modal Container */
        <div className="aero-modal relative w-full max-w-4xl bg-surface border border-amber/30 rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.1)] flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-zoom z-10" onClick={e => e.stopPropagation()}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted hover:text-amber hover:bg-surface-alt bg-bg/80 rounded-full z-10 transition-colors"
          >
            <X size={16} />
          </button>

          {!data || data.error ? (
            <div className="p-12 flex justify-center flex-col items-center gap-4">
              <p className="text-muted">Video not found.</p>
            </div>
          ) : (
            <div className="overflow-y-auto">
            {/* Top Thumbnail Header */}
            <div className="w-full relative py-8 flex justify-center overflow-hidden bg-bg/40">
              <div 
                className="absolute inset-0 bg-cover bg-bottom opacity-60 mix-blend-screen" 
                style={{ 
                  backgroundImage: 'url(/water-pattern.jpg)',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0) 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0) 100%)'
                }} 
              />
              {/* Top subtle shade */}
              <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-10" />
              
              <img 
                src={data.video.thumbnail_url?.replace(/hqdefault\.jpg|mqdefault\.jpg|sddefault\.jpg/g, 'maxresdefault.jpg') || data.video.thumbnail_url} 
                alt="" 
                onLoad={(e) => {
                  if (e.currentTarget.naturalWidth === 120 && e.currentTarget.src.includes('maxresdefault.jpg')) {
                    e.currentTarget.src = data.video.thumbnail_url || `https://i.ytimg.com/vi/${data.video.id}/hqdefault.jpg`
                    return
                  }
                  setImgLoaded(true)
                }}
                onError={(e) => {
                  e.currentTarget.src = data.video.thumbnail_url || `https://i.ytimg.com/vi/${data.video.id}/hqdefault.jpg`
                  setImgLoaded(true)
                }}
                className={`w-full max-w-[640px] aspect-video object-cover rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] relative z-10 transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0 bg-surface-alt/50'}`} 
              />
              
              {/* Bottom Gradient Fade */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-bg/80 pointer-events-none z-10" />
            </div>

            {/* Stats Row */}
            <div className="flex justify-center gap-12 text-sm font-semibold mb-6 py-3 bg-surface-alt/50">
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
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <div className="relative mb-2">
                      <a 
                        href={`/videos/${videoId}`}
                        onClick={() => {
                          window.location.href = `/videos/${videoId}`;
                        }}
                        className="font-extrabold text-ink hover:text-amber text-xl sm:text-2xl transition block leading-tight"
                      >
                        {cleanVideoTitle(data.video.title)}
                      </a>
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
                      className="flex items-center gap-2.5 group/channel min-w-0 mt-2"
                    >
                      {data.video.channel_thumbnail_url ? (
                        <img 
                          src={data.video.channel_thumbnail_url} 
                          alt="" 
                          className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm" 
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber/20 border border-amber/40 flex items-center justify-center text-amber text-sm font-bold shrink-0">
                          {data.video.channel?.[0]?.toUpperCase() || 'C'}
                        </div>
                      )}
                      <span className="text-lg font-semibold text-muted group-hover/channel:text-amber transition-colors line-clamp-1">
                        {data.video.channel}
                      </span>
                    </a>
                  </div>

                  {data.myRatingData && (
                    <UserLogDisplay myRatingData={data.myRatingData} videoUrl={data.video.url} showFullReviewLink={true} />
                  )}

                  <VideoReviewsList 
                    reviews={data.reviews} 
                    videoUrl={data.video.url} 
                    currentUserId={currentUser?.id} 
                    followingIds={data.followingIds}
                    showFullReviewLink={true}
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
                    isLoggedIn={!!currentUser}
                  />
                  </Suspense>

                  {/* Stats Box */}
                  <div className="bg-surface rounded-xl p-6 shadow-xl shadow-amber/5">
                    <div className="flex flex-col items-center mb-6">
                      <span className="font-mono font-black text-amber text-5xl mb-2">
                        {data.video.computedAvgRating != null ? Number(data.video.computedAvgRating).toFixed(1) : '—'}
                      </span>
                      <Scrubber value={data.video.computedAvgRating != null ? Number(data.video.computedAvgRating) : 0} interactive={false} height={18} />
                      <div className="text-xs text-muted uppercase tracking-widest font-bold mt-4">
                        {data.total} {data.total === 1 ? 'Rating' : 'Ratings'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  )
}
