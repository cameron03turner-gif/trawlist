import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Youtube, Share, Star, ListVideo, Heart } from 'lucide-react'
import Link from 'next/link'
import { Scrubber } from '@/components/Scrubber'
import { VideoReviewsList } from '@/components/VideoReviewsList'
import { VideoGridCard } from '@/components/VideoGridCard'
import { ShareButton } from '@/components/ShareButton'
import { VideoActionPanel } from '@/components/VideoActionPanel'
import { ListCard } from '@/components/ListCard'
import { UserLogDisplay } from '@/components/UserLogDisplay'

export const revalidate = 0

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props) {
  const params = await props.params
  const supabase = await createClient()
  const { data: video } = await supabase
    .from('video_leaderboard')
    .select('title')
    .eq('id', params.id)
    .single()

  if (!video) return { title: 'Video Not Found | Trawlist' }
  return { title: `${video.title} | Trawlist` }
}

export default async function VideoPage(props: Props) {
  const params = await props.params
  const videoId = params.id
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch video info & aggregated stats
  const { data: videoData } = await supabase
    .from('video_leaderboard')
    .select('*')
    .eq('id', videoId)
    .single()

  if (!videoData) {
    notFound()
  }

  // Fetch all ratings for distribution
  const { data: allRatings } = await supabase
    .from('ratings')
    .select('user_id, rating, review, profiles!ratings_user_id_fkey(username, display_name, avatar_url), review_likes(user_id)')
    .eq('video_id', videoId)
    .not('rating', 'is', null)
    .order('updated_at', { ascending: false })

  const distribution: Record<string, number> = {}
  const reviews: any[] = []

  if (allRatings) {
    allRatings.forEach(r => {
      const rStr = Number(r.rating).toFixed(1)
      distribution[rStr] = (distribution[rStr] || 0) + 1
      if (r.review) {
        reviews.push({ ...r, profile: r.profiles, like_count: r.review_likes?.length || 0 })
      }
    })
  }

  const totalRatings = allRatings?.length || 0

  let isOnWatchlist = false
  let isLiked = false
  let isLogged = false
  let myRatingData = null
  let followingIds: string[] = []

  if (user) {
    const { data: userRating } = await supabase
      .from('ratings')
      .select('watch_status, liked, rating, review, note, updated_at')
      .eq('video_id', videoId)
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (userRating) {
      myRatingData = userRating
      if (userRating.watch_status === 'want_to_watch') {
        isOnWatchlist = true
      }
      if (userRating.liked) {
        isLiked = true
      }
      if (userRating.rating || userRating.review || userRating.note) {
        isLogged = true
      }
    }

    const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', user.id)
    followingIds = follows?.map(f => f.following_id) || []
  }

  // Fetch Stats
  const [
    { count: favoritesCount },
    { count: listsCount }
  ] = await Promise.all([
    supabase.from('ratings').select('*', { count: 'exact', head: true }).eq('video_id', videoId).eq('liked', true),
    supabase.from('list_items').select('*', { count: 'exact', head: true }).eq('video_id', videoId),
  ])

  // Fetch Popular Lists containing this video
  const { data: popularListsItems } = await supabase
    .from('list_items')
    .select(`
      list_id,
      lists!inner (
        id, title, description, is_private, is_ranked,
        owner:profiles ( username, display_name, avatar_url ),
        items:list_items ( video:videos ( thumbnail_url ) ),
        items_count:list_items ( count ),
        likes_count:list_likes ( count )
      )
    `)
    .eq('video_id', videoId)
    .eq('lists.is_private', false)
    .limit(3)
  
  const popularLists = popularListsItems?.map((item: any) => item.lists).filter(Boolean) || []

  let moreFromChannelQuery = supabase
    .from('video_leaderboard')
    .select('*')
    .neq('id', videoId)
    .order('avg_rating', { ascending: false })
    .limit(4)

  if (videoData.channel_id) {
    moreFromChannelQuery = moreFromChannelQuery.eq('channel_id', videoData.channel_id)
  } else if (videoData.channel) {
    moreFromChannelQuery = moreFromChannelQuery.eq('channel', videoData.channel)
  }

  const { data: moreFromChannel } = await moreFromChannelQuery

  let userLoggedSet = new Set<string>()
  if (user && moreFromChannel && moreFromChannel.length > 0) {
    const videoIds = moreFromChannel.map(v => v.id)
    const { data: ratingsData } = await supabase
      .from('ratings')
      .select('video_id, rating, review, note, watch_status')
      .eq('user_id', user.id)
      .in('video_id', videoIds)
      
    if (ratingsData) {
      userLoggedSet = new Set(
        ratingsData
          .filter(r => r.rating || r.review || r.note || r.watch_status === 'watched')
          .map(r => r.video_id)
      )
    }
  }

  return (
    <div className="pt-4 px-4 pb-16 max-w-4xl mx-auto">
      {/* YouTube Player */}
      <div className="mb-4 rounded-2xl overflow-hidden shadow-2xl border border-amber bg-black aspect-video relative z-0" style={{ transform: 'translateZ(0)' }}>
        <iframe 
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
          title={videoData.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-2xl"
        ></iframe>
      </div>

            <div className="flex justify-center gap-12 text-sm font-semibold mb-6 border-y border-border/50 py-3">
              <div className="flex items-center gap-2" title={`${totalRatings || 0} Rated`}>
                <Star size={20} className="text-amber" />
                <span className="text-muted group-hover:text-ink transition">{totalRatings || 0}</span>
              </div>
              <div className="flex items-center gap-2" title={`${listsCount || 0} Lists`}>
                <ListVideo size={20} className="text-amber" />
                <span className="text-muted group-hover:text-ink transition">{listsCount || 0}</span>
              </div>
              <div className="flex items-center gap-2" title={`${favoritesCount || 0} Liked`}>
                <Heart size={20} className="text-rec" />
                <span className="text-muted group-hover:text-ink transition">{favoritesCount || 0}</span>
              </div>
            </div>
      
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                <div className="relative mb-2">
                  <h1 className="text-3xl font-extrabold text-ink leading-tight pr-12">{videoData.title}</h1>
                  {isLiked && (
                    <div title="You liked this video" className="absolute top-0 right-0 mt-1 pointer-events-none">
                      <Heart size={28} className="fill-rec text-rec" />
                    </div>
                  )}
                </div>
                <Link href={`/channel/${encodeURIComponent(videoData.channel_id || videoData.channel)}`} className="flex items-center gap-2 group/channel">
                  {videoData.channel_thumbnail_url && (
                    <img src={videoData.channel_thumbnail_url} alt="" className="w-6 h-6 rounded-full object-cover border border-border/50 shrink-0 group-hover/channel:border-amber transition-colors" referrerPolicy="no-referrer" />
                  )}
                  <span className="text-base text-muted font-medium group-hover/channel:text-amber transition-colors">
                    {videoData.channel}
                  </span>
                </Link>
          </div>

          {isLogged && myRatingData && (
            <UserLogDisplay myRatingData={myRatingData} videoUrl={videoData.url} />
          )}

          <VideoReviewsList 
            reviews={reviews} 
            videoUrl={videoData.url} 
            currentUserId={user?.id} 
            followingIds={followingIds}
          />

          {popularLists.length > 0 && (
            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-6">Popular Lists</h3>
              <div className="space-y-4">
                {popularLists.map((list: any) => (
                  <ListCard key={list.id} list={list} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <VideoActionPanel videoId={videoId} videoUrl={videoData.url} title={videoData.title} initialIsOnWatchlist={isOnWatchlist} initialIsLogged={isLogged} />
          {/* Stats Box */}
          <div className="bg-surface border border-amber rounded-xl p-6 shadow-xl shadow-amber/5">
            <div className="flex flex-col items-center mb-6">
              <span className="font-mono font-black text-amber text-5xl mb-2">{Number(videoData.avg_rating).toFixed(1)}</span>
              <Scrubber value={Number(videoData.avg_rating)} interactive={false} height={18} />
              <div className="text-xs text-muted uppercase tracking-widest font-bold mt-4">
                {totalRatings} Ratings
              </div>
            </div>

            {/* Distribution */}
            {totalRatings > 0 && (
              <div>
                <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 text-center">Rating Distribution</h3>
                <div className="flex h-24 gap-1">
                  {['0.5','1.0','1.5','2.0','2.5','3.0','3.5','4.0','4.5','5.0'].map(bucket => {
                    const count = distribution[bucket] || 0
                    const maxDist = Math.max(...Object.values(distribution), 1)
                    const heightPct = (count / maxDist) * 100
                    return (
                      <div key={bucket} className="flex flex-col items-center flex-1 gap-1 group h-full">
                        <div className="w-full bg-surface-alt rounded-sm relative flex items-end justify-center flex-1 overflow-hidden" title={`${count} ratings`}>
                          <div 
                            className="w-full bg-amber rounded-sm transition-all group-hover:brightness-110" 
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <div className="text-[9px] text-muted font-mono transform -rotate-45 origin-top-left mt-2 opacity-50">
                          {bucket}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {moreFromChannel && moreFromChannel.length > 0 && (
        <div className="mt-16 pt-12 border-t border-border">
          <h2 className="text-xl font-bold mb-6">More from {videoData.channel}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {moreFromChannel.map(v => (
              <VideoGridCard 
                key={v.id} 
                title={v.title}
                channel={v.channel}
                channelId={v.channel_id}
                channelThumbnail={v.channel_thumbnail_url}
                thumbnail={v.thumbnail_url}
                url={v.url}
                rating={v.avg_rating}
                count={v.rating_count}
                likesCount={v.likes_count}
                reviewsCount={v.review_count}
                detailUrl={`/videos/${v.id}`}
                isLogged={userLoggedSet.has(v.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
