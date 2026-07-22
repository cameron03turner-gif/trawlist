import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { VideoGridCard } from '@/components/VideoGridCard'

export const revalidate = 0

type Props = {
  params: Promise<{ channelId: string }>
}

export default async function ChannelPage(props: { params: Promise<{ channelId: string }> }) {
  const params = await props.params
  
  
  const decodedId = decodeURIComponent(params.channelId)

  const supabase = await createClient()

  // Fetch channel metadata
  const { data: channel } = await supabase
    .from('channels')
    .select('*')
    .eq('id', decodedId)
    .single()

  if (!channel) {
    notFound()
  }

  // Fetch channel aggregated stats
  const { data: stats } = await supabase
    .from('channel_leaderboard')
    .select('video_count, total_ratings, avg_rating')
    .eq('id', decodedId)
    .maybeSingle()

  // Fetch videos for this channel, ordered by average rating
  const { data: videos } = await supabase
    .from('video_leaderboard')
    .select('*')
    .eq('channel_id', decodedId)
    .order('avg_rating', { ascending: false })

  // Fetch current user likes and logs if logged in
  const { data: { session } } = await supabase.auth.getSession()
  let userLikes = new Set<string>()
  let userLogged = new Set<string>()
  
  if (session && videos) {
    const videoIds = videos.map(v => v.id)
    if (videoIds.length > 0) {
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('video_id, liked')
        .eq('user_id', session.user.id)
        .in('video_id', videoIds)
        
      if (ratingsData) {
        userLikes = new Set(ratingsData.filter(r => r.liked).map(l => l.video_id))
        userLogged = new Set(ratingsData.map(r => r.video_id))
      }
    }
  }

  return (
    <div className="pt-8 px-4 pb-16 max-w-6xl mx-auto">
      {/* Channel Header */}
      <div className="bg-surface border border-amber rounded-xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        {channel.thumbnail_url ? (
          <img 
            src={channel.thumbnail_url} 
            alt={channel.name} 
            className="w-32 h-32 rounded-full border-4 border-surface-alt shadow-xl shrink-0" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-surface-alt flex items-center justify-center text-4xl font-bold border-4 border-surface shadow-xl shrink-0 text-amber">
            {channel.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="flex-1 mt-2">
          <h1 className="text-3xl font-extrabold text-ink mb-2">{channel.name}</h1>
          <p className="text-muted font-mono text-sm mb-6">{decodedId}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="bg-surface-alt border border-amber rounded-lg px-4 py-2 text-center min-w-[120px]">
              <div className="text-2xl font-bold text-amber">
                {stats?.avg_rating ? Number(stats.avg_rating).toFixed(2) : '--'}
              </div>
              <div className="text-xs text-muted font-medium uppercase tracking-wider mt-1">Avg Rating</div>
            </div>
            <div className="bg-surface-alt border border-amber rounded-lg px-4 py-2 text-center min-w-[120px]">
              <div className="text-2xl font-bold text-ink">
                {stats?.video_count || (videos ? videos.length : 0)}
              </div>
              <div className="text-xs text-muted font-medium uppercase tracking-wider mt-1">Videos Logged</div>
            </div>
            <div className="bg-surface-alt border border-amber rounded-lg px-4 py-2 text-center min-w-[120px]">
              <div className="text-2xl font-bold text-ink">
                {stats?.total_ratings || '--'}
              </div>
              <div className="text-xs text-muted font-medium uppercase tracking-wider mt-1">Total Ratings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-ink">Top Rated Videos</h2>
        </div>
        
        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {videos.map((v, index) => (
              <VideoGridCard 
                key={v.id}
                title={v.title}
                channel={v.channel}
                channelId={v.channel_id}
                channelThumbnail={v.channel_thumbnail_url}
                thumbnail={v.thumbnail_url}
                url={`/?v=${v.id}`}
                rating={v.avg_rating ? Number(v.avg_rating) : null}
                count={v.rating_count}
                rank={index + 1}
                liked={userLikes.has(v.id)}
                isLogged={userLogged.has(v.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface border border-amber rounded-xl">
            <p className="text-muted">No videos from this channel have been rated yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
