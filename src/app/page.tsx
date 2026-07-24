import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { VideoGridCard } from '@/components/VideoGridCard'
import { LandingTrendingTabs } from '@/components/LandingTrendingTabs'
import { ChromeExtensionBanner } from '@/components/ChromeExtensionBanner'
import { Film, Users, Zap, Search, ArrowRight, Sparkles, Star, ShieldCheck, Download, ExternalLink, Tv } from 'lucide-react'
import { CHROME_STORE_URL } from '@/lib/constants'

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
      return (
        <div className="pt-12 px-4 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-ink">Welcome to Trawlist!</h1>
          <p className="text-muted mt-2">Please finish setting up your profile by going to your profile page.</p>
        </div>
      )
    }

    // Fetch Network Popular and Taste Based concurrently
    const [{ data: networkVideos }, { data: tasteVideos }] = await Promise.all([
      supabase.rpc('get_network_popular_videos', { p_user_id: session.user.id, p_limit: 4 }),
      supabase.rpc('get_taste_based_recommendations', { p_user_id: session.user.id, p_limit: 4 }),
    ])

    // Filter out watchlist-only videos (0 ratings / null average)
    const validTasteVideos = (tasteVideos || []).filter((v: any) => v.avg_rating !== null && Number(v.rating_count || v.rec_score || 1) > 0)
    const validNetworkVideos = (networkVideos || []).filter((v: any) => v.avg_rating !== null && Number(v.rating_count || 0) > 0)

    let userLogged: string[] = []
    let userReviewed: string[] = []
    let userLiked: string[] = []
    const videoStats: Record<string, { count: number }> = {}
    const reviewCounts: Record<string, number> = {}
    const likeCounts: Record<string, number> = {}
    
    // Collect all video ids displayed
    const videoIds = new Set<string>()
    if (networkVideos) networkVideos.forEach((v: any) => videoIds.add(v.video_id))
    if (tasteVideos) tasteVideos.forEach((v: any) => videoIds.add(v.video_id))
    
    if (videoIds.size > 0) {
      const vIdsArray = Array.from(videoIds)
      
      const [
        { data: userRatings },
        { data: stats },
        { data: reviewsCountData },
        { data: likesCountData }
      ] = await Promise.all([
        supabase.from('ratings').select('video_id, review, liked').eq('user_id', session.user.id).in('video_id', vIdsArray),
        supabase.from('video_leaderboard').select('id, rating_count').in('id', vIdsArray),
        supabase.from('ratings').select('video_id').in('video_id', vIdsArray).not('review', 'is', null).neq('review', ''),
        supabase.from('ratings').select('video_id').in('video_id', vIdsArray).eq('liked', true),
      ])
        
      if (userRatings) {
        userLogged = userRatings.map(r => r.video_id)
        userReviewed = userRatings.filter(r => r.review && r.review.trim().length > 0).map(r => r.video_id)
        userLiked = userRatings.filter(r => r.liked).map(r => r.video_id)
      }
        
      if (stats) {
        stats.forEach(s => {
          videoStats[s.id] = { count: s.rating_count }
        })
      }
        
      if (reviewsCountData) {
        reviewsCountData.forEach(r => {
          reviewCounts[r.video_id] = (reviewCounts[r.video_id] || 0) + 1
        })
      }
        
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
            <div className="flex items-center justify-between mb-4 border-b border-amber/30 pb-2">
              <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                <Zap className="text-amber" size={20} />
                You Might Like
              </h2>
            </div>
            
            {(!validTasteVideos || validTasteVideos.length === 0) ? (
              <div className="text-center py-12 bg-surface rounded-xl border border-amber">
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
                    hasUserReviewed={userReviewed.includes(v.video_id)}
                    liked={userLiked.includes(v.video_id)}
                    count={videoStats[v.video_id]?.count || 0}
                    reviewsCount={reviewCounts[v.video_id] || 0}
                    likesCount={likeCounts[v.video_id] || 0}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mb-12">
            <div className="flex items-center justify-between mb-4 border-b border-amber/30 pb-2">
              <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                <Users className="text-amber" size={20} />
                Popular in Your Network
              </h2>
            </div>
            
            {(!validNetworkVideos || validNetworkVideos.length === 0) ? (
              <div className="text-center py-12 bg-surface rounded-xl border border-amber">
                <Users className="mx-auto text-muted mb-4" size={32} />
                <h3 className="text-lg font-medium text-ink mb-2">Build your network</h3>
                <p className="text-muted mb-6">Follow some friends to see what they're watching!</p>
                <Link 
                  href="/videos"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-amber text-bg hover:brightness-110 transition"
                >
                  Explore Community Ratings
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
                    hasUserReviewed={userReviewed.includes(v.video_id)}
                    liked={userLiked.includes(v.video_id)}
                    count={v.rating_count}
                    reviewsCount={reviewCounts[v.video_id] || 0}
                    likesCount={likeCounts[v.video_id] || 0}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Chrome Extension Promo for Signed-In Users */}
          <section className="mb-8">
            <ChromeExtensionBanner variant="dashboard" />
          </section>
        </div>
      </div>
    )
  }

  // For Signed-Out Users (Interactive High-Polish Landing Page)
  const [{ data: topVideos }, { data: popularLists }, { data: recentReviews }] = await Promise.all([
    supabase
      .from('video_leaderboard')
      .select('*')
      .gt('rating_count', 0)
      .not('avg_rating', 'is', null)
      .order('avg_rating', { ascending: false })
      .order('rating_count', { ascending: false })
      .limit(4),
    supabase
      .from('custom_lists')
      .select(`
        id,
        title,
        description,
        is_private,
        is_ranked,
        created_at,
        owner:profiles!custom_lists_owner_id_fkey(username, display_name, avatar_url),
        items:list_items(
          position,
          video:videos(thumbnail_url)
        ),
        items_count:list_items(count)
      `)
      .eq('is_private', false)
      .limit(3),
    supabase
      .from('ratings')
      .select(`
        id,
        video_id,
        rating,
        review,
        created_at,
        profiles:user_id(username, display_name, avatar_url)
      `)
      .not('review', 'is', null)
      .neq('review', '')
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  return (
    <div className="overflow-hidden bg-transparent">
      {/* Hero Section */}
      <div className="relative py-10 lg:py-14 border-b border-amber/30">
        {/* Ambient Gradient Blur Backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-r from-amber/10 via-cyan-500/10 to-purple-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />
        
        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-amber/40 text-amber text-xs font-bold mb-4 shadow-md shadow-amber/5">
            <Sparkles size={14} className="animate-pulse" />
            <span>A Social Network for YouTube & Video Enthusiasts</span>
          </div>

          <h1 className="font-display font-bold text-5xl lg:text-7xl tracking-tight text-ink mb-4 leading-[1.1]">
            TRAWLIST
            <span className="block text-xl lg:text-3xl font-semibold text-muted mt-2 font-body">
              Log, rate, and discover videos you love.
            </span>
          </h1>

          <p className="text-sm lg:text-base text-muted max-w-xl mx-auto mb-6 leading-relaxed">
            Track what you watch, write reviews, curate custom video playlists, and share recommendations with a community of video lovers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3 bg-amber text-bg font-black rounded-full hover:brightness-110 hover:scale-105 transition-all shadow-xl shadow-amber/20 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              Get Started Free <ArrowRight size={16} />
            </Link>

            <Link
              href="/videos"
              className="w-full sm:w-auto px-7 py-3 bg-surface-alt text-ink font-bold rounded-full border border-amber hover:bg-surface hover:border-amber transition-all text-xs"
            >
              Explore Community Ratings
            </Link>

            <Link
              href="/extension"
              className="w-full sm:w-auto px-7 py-3 bg-surface-alt text-ink font-bold rounded-full border border-amber hover:bg-surface hover:border-amber transition-all text-xs flex items-center justify-center gap-2"
            >
              <Download size={14} className="text-amber" />
              <span>Chrome Extension</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Value Props / Features Grid */}
      <div className="py-10 bg-transparent relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold font-display text-ink mb-2">Built for Modern Video Curators</h2>
            <p className="text-muted max-w-xl mx-auto text-xs">Everything you need to organize your viewing history and discover remarkable content.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-amber rounded-2xl p-6 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber/10 hover:brightness-110 hover:z-10 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-amber/10 text-amber rounded-2xl flex items-center justify-center mb-4 border border-amber/30 shadow-lg shadow-amber/5">
                  <Film size={24} />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">Track Your Watching</h3>
                <p className="text-muted text-xs leading-relaxed">
                  Keep a precise diary of every video essay, documentary, and breakdown you watch. Rate with precision using our 5-star scrubber and record your personal reviews.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border/50 text-xs font-semibold text-amber flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                <Star size={14} className="fill-amber shrink-0" /> 0.5 to 5 star ratings
              </div>
            </div>

            <div className="bg-surface border border-amber rounded-2xl p-6 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber/10 hover:brightness-110 hover:z-10 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-amber/10 text-amber rounded-2xl flex items-center justify-center mb-4 border border-amber/30 shadow-lg shadow-amber/5">
                  <Users size={24} />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">Follow Friends</h3>
                <p className="text-muted text-xs leading-relaxed">
                  Connect with friends and trusted critics. See their recent activity in a distraction-free chronological feed and compare your ratings on shared favorites.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border/50 text-xs font-semibold text-amber flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                <ShieldCheck size={14} className="shrink-0" /> Chronological friend feed
              </div>
            </div>

            <div className="bg-surface border border-amber rounded-2xl p-6 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber/10 hover:brightness-110 hover:z-10 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-amber/10 text-amber rounded-2xl flex items-center justify-center mb-4 border border-amber/30 shadow-lg shadow-amber/5">
                  <Search size={24} />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">Discover Gold</h3>
                <p className="text-muted text-xs leading-relaxed">
                  Bypass generic algorithm traps. Uncover hidden gems through community ratings, taste-based recommendations, and user-curated playlists.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border/50 text-xs font-semibold text-amber flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                <Sparkles size={14} className="shrink-0" /> Community curated lists
              </div>
            </div>
          </div>

          {/* Featured Chrome Extension Showcase Banner */}
          <ChromeExtensionBanner variant="landing" />
        </div>
      </div>

      {/* Community Highlights Hub */}
      <LandingTrendingTabs
        topVideos={topVideos || []}
        popularLists={popularLists || []}
        recentReviews={recentReviews || []}
      />

      {/* Bottom Conversion Banner */}
      <div className="py-10 bg-transparent relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-surface border border-amber rounded-3xl p-8 sm:p-10 shadow-2xl shadow-amber/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-2xl sm:text-3xl font-black text-ink font-display mb-3">
              Ready to Upgrade Your YouTube Experience?
            </h2>
            <p className="text-muted max-w-xl mx-auto text-xs sm:text-sm mb-6 leading-relaxed">
              Join Trawlist today to start logging your watched videos, curating custom lists, and discovering recommendations from real enthusiasts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3.5 bg-amber text-bg font-black rounded-full hover:brightness-110 hover:scale-105 transition-all shadow-xl shadow-amber/20 text-xs uppercase tracking-wider"
              >
                Create Your Account Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
