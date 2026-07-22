import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { VideoGridCard } from '@/components/VideoGridCard'
import { Film, Users, Zap, Search } from 'lucide-react'

export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // For Signed-In Users
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', session.user.id)
      .single()

    // Needs a username to proceed
    if (!profile?.username) {
      // Just in case they somehow bypassed onboarding
      return (
        <div className="pt-12 px-4 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-ink">Welcome to Trawlist!</h1>
          <p className="text-muted mt-2">Please finish setting up your profile by going to your profile page.</p>
        </div>
      )
    }

    // Fetch Network Popular
    const { data: networkVideos } = await supabase
      .rpc('get_network_popular_videos', { p_user_id: session.user.id, p_limit: 4 })

    // Fetch Taste Based
    const { data: tasteVideos } = await supabase
      .rpc('get_taste_based_recommendations', { p_user_id: session.user.id, p_limit: 4 })

    // Filter out watchlist-only videos (0 ratings / null average)
    const validTasteVideos = (tasteVideos || []).filter((v: any) => v.avg_rating !== null && Number(v.rating_count || v.rec_score || 1) > 0)
    const validNetworkVideos = (networkVideos || []).filter((v: any) => v.avg_rating !== null && Number(v.rating_count || 0) > 0)

    let userLogged: string[] = []
    const videoStats: Record<string, { count: number }> = {}
    const reviewCounts: Record<string, number> = {}
    const likeCounts: Record<string, number> = {}
    
    // Collect all video ids displayed
    const videoIds = new Set<string>()
    if (networkVideos) networkVideos.forEach((v: any) => videoIds.add(v.video_id))
    if (tasteVideos) tasteVideos.forEach((v: any) => videoIds.add(v.video_id))
    
    if (videoIds.size > 0) {
      const vIdsArray = Array.from(videoIds)
      
      const { data: userRatings } = await supabase
        .from('ratings')
        .select('video_id')
        .eq('user_id', session.user.id)
        .in('video_id', vIdsArray)
        
      if (userRatings) {
        userLogged = userRatings.map(r => r.video_id)
      }

      const { data: stats } = await supabase
        .from('video_leaderboard')
        .select('id, rating_count')
        .in('id', vIdsArray)
        
      if (stats) {
        stats.forEach(s => {
          videoStats[s.id] = { count: s.rating_count }
        })
      }

      const { data: reviewsCountData } = await supabase
        .from('ratings')
        .select('video_id')
        .in('video_id', vIdsArray)
        .not('review', 'is', null)
        .neq('review', '')
        
      if (reviewsCountData) {
        reviewsCountData.forEach(r => {
          reviewCounts[r.video_id] = (reviewCounts[r.video_id] || 0) + 1
        })
      }

      const { data: likesCountData } = await supabase
        .from('ratings')
        .select('video_id')
        .in('video_id', vIdsArray)
        .eq('liked', true)
        
      if (likesCountData) {
        likesCountData.forEach(r => {
          likeCounts[r.video_id] = (likeCounts[r.video_id] || 0) + 1
        })
      }
    }

    return (
      <div className="pt-8 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-ink mb-2">Welcome back, {profile.display_name || profile.username}</h1>
            <p className="text-muted">Here's what's happening on Trawlist.</p>
          </div>

          <section className="mb-12">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                <Zap className="text-amber" size={20} />
                You Might Like
              </h2>
            </div>
            
            {(!validTasteVideos || validTasteVideos.length === 0) ? (
              <div className="text-center py-12 bg-surface rounded-xl border border-border">
                <Zap className="mx-auto text-muted mb-4" size={32} />
                <h3 className="text-lg font-medium text-ink mb-2">Keep rating</h3>
                <p className="text-muted">Rate some more videos to get personalized recommendations!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {validTasteVideos.map((v: any) => (
                  <VideoGridCard 
                    key={v.video_id}
                    title={v.title}
                    channel={v.channel}
                    channelId={v.channel_id}
                    channelThumbnail={v.channel_thumbnail_url}
                    thumbnail={v.thumbnail_url}
                    url={v.url}
                    detailUrl={`/videos/${v.video_id}`}
                    rating={v.avg_rating ? Number(v.avg_rating) : null}
                    isLogged={userLogged.includes(v.video_id)}
                    count={videoStats[v.video_id]?.count || 0}
                    reviewsCount={reviewCounts[v.video_id] || 0}
                    likesCount={likeCounts[v.video_id] || 0}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mb-12">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                <Users className="text-amber" size={20} />
                Popular in Your Network
              </h2>
            </div>
            
            {(!validNetworkVideos || validNetworkVideos.length === 0) ? (
              <div className="text-center py-12 bg-surface rounded-xl border border-border">
                <Users className="mx-auto text-muted mb-4" size={32} />
                <h3 className="text-lg font-medium text-ink mb-2">Build your network</h3>
                <p className="text-muted mb-6">Follow some friends to see what they're watching!</p>
                <Link 
                  href="/videos"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-amber text-bg hover:brightness-110 transition"
                >
                  Explore Leaderboard
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {validNetworkVideos.map((v: any) => (
                  <VideoGridCard 
                    key={v.video_id}
                    title={v.title}
                    channel={v.channel}
                    channelId={v.channel_id}
                    channelThumbnail={v.channel_thumbnail_url}
                    thumbnail={v.thumbnail_url}
                    url={v.url}
                    detailUrl={`/videos/${v.video_id}`}
                    rating={v.avg_rating ? Number(v.avg_rating) : null}
                    isLogged={userLogged.includes(v.video_id)}
                    count={v.rating_count}
                    reviewsCount={reviewCounts[v.video_id] || 0}
                    likesCount={likeCounts[v.video_id] || 0}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    )
  }

  // For Signed-Out Users (Landing Page)
  const { data: topVideos } = await supabase
    .from('video_leaderboard')
    .select('*')
    .gt('rating_count', 0)
    .not('avg_rating', 'is', null)
    .order('avg_rating', { ascending: false })
    .order('rating_count', { ascending: false })
    .limit(4)

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-surface py-20 lg:py-32 border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-amber/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-ink tracking-tight mb-6">
            Trawlist
            <span className="block text-2xl lg:text-4xl font-semibold text-muted mt-3">
              Log, rate, and discover YouTube videos you love.
            </span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Trawlist is a social network for YouTube enthusiasts. Track what you watch, write reviews, curate custom video lists, and share recommendations with friends.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="px-8 py-4 bg-amber text-amber-950 font-bold rounded-full hover:bg-amber/90 hover:scale-105 transition-all shadow-lg shadow-amber/20">
              Create an Account
            </Link>
            <Link href="/videos" className="px-8 py-4 bg-surface-alt text-ink font-semibold rounded-full border border-border hover:bg-surface hover:border-amber/50 transition-all">
              Explore Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Value Props */}
      <div className="py-20 bg-bg">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="p-6">
            <div className="w-16 h-16 mx-auto bg-amber/10 text-amber rounded-2xl flex items-center justify-center mb-6 border border-amber/20 shadow-xl shadow-amber/5">
              <Film size={32} />
            </div>
            <h3 className="text-xl font-bold text-ink mb-3">Track Your Watching</h3>
            <p className="text-muted leading-relaxed">Keep a diary of every essay, documentary, and sketch you watch. Rate them and write your thoughts.</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 mx-auto bg-pink-500/10 text-pink-500 rounded-2xl flex items-center justify-center mb-6 border border-pink-500/20 shadow-xl shadow-pink-500/5">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-ink mb-3">Follow Friends</h3>
            <p className="text-muted leading-relaxed">See what your network is watching in a chronological feed. Curate lists and share them with the world.</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 mx-auto bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 shadow-xl shadow-blue-500/5">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-ink mb-3">Discover Gold</h3>
            <p className="text-muted leading-relaxed">Escape the algorithm. Find high-quality videos through community curation and taste-based recommendations.</p>
          </div>
        </div>
      </div>

      {/* Top Videos Preview */}
      {topVideos && topVideos.length > 0 && (
        <div className="py-20 bg-surface border-t border-border">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-ink mb-4">Trending on Trawlist</h2>
              <p className="text-muted">The highest rated videos in the community right now.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {topVideos.map(v => (
                <VideoGridCard 
                  key={v.id}
                  title={v.title}
                  channel={v.channel}
                  channelId={v.channel_id}
                  channelThumbnail={v.channel_thumbnail_url}
                  thumbnail={v.thumbnail_url}
                  url={v.url}
                  detailUrl={`/videos/${v.id}`}
                  rating={Number(v.avg_rating)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
