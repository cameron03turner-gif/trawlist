import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { VideoGridCard } from '@/components/VideoGridCard'
import { fetchChannelThumbnail } from '@/lib/youtube'
import { Metadata } from 'next'

export const revalidate = 0

type Props = {
  params: Promise<{ channelId: string }>
}

async function resolveChannel(supabase: any, decodedId: string) {
  // 1. Try exact match on `channels` table
  let { data: channel } = await supabase
    .from('channels')
    .select('*')
    .eq('id', decodedId)
    .maybeSingle()

  // 2. Try match with '@' prefix if missing
  if (!channel && !decodedId.startsWith('@')) {
    const { data: channelWithAt } = await supabase
      .from('channels')
      .select('*')
      .eq('id', '@' + decodedId)
      .maybeSingle()
    if (channelWithAt) channel = channelWithAt
  }

  // 3. Fallback: Check if videos exist for this channel_id or channel name
  if (!channel) {
    const { data: sampleVideo } = await supabase
      .from('videos')
      .select('channel, channel_id, channel_thumbnail_url')
      .or(`channel_id.eq.${decodedId},channel_id.eq.@${decodedId},channel.ilike.${decodedId}`)
      .limit(1)
      .maybeSingle()

    if (sampleVideo) {
      const resolvedChannelId = sampleVideo.channel_id || decodedId
      const channelName = sampleVideo.channel || decodedId
      const thumbnailUrl = sampleVideo.channel_thumbnail_url || null

      channel = {
        id: resolvedChannelId,
        name: channelName,
        thumbnail_url: thumbnailUrl,
      }

      // Auto-upsert into `channels` table
      await supabase.from('channels').upsert(
        {
          id: resolvedChannelId,
          name: channelName,
          ...(thumbnailUrl ? { thumbnail_url: thumbnailUrl } : {}),
        },
        { onConflict: 'id' }
      ).catch(() => null)
    }
  }

  // 4. If thumbnail is missing, attempt to fetch from YouTube
  if (channel && !channel.thumbnail_url) {
    let authorUrl = null
    if (channel.id.startsWith('@')) {
      authorUrl = `https://www.youtube.com/${channel.id}`
    } else if (channel.id.startsWith('UC') && channel.id.length >= 20) {
      authorUrl = `https://www.youtube.com/channel/${channel.id}`
    }

    if (authorUrl) {
      try {
        const fetchedThumb = await fetchChannelThumbnail(authorUrl)
        if (fetchedThumb) {
          channel.thumbnail_url = fetchedThumb
          await supabase.from('channels').update({ thumbnail_url: fetchedThumb }).eq('id', channel.id).catch(() => null)
        }
      } catch {
        // Ignore fetch errors
      }
    }
  }

  return channel
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const decodedId = decodeURIComponent(params.channelId)
  const supabase = await createClient()

  const channel = await resolveChannel(supabase, decodedId)
  if (!channel) return { title: 'Channel Not Found | Trawlist' }

  const channelName = channel.name || channel.title || decodedId

  const { data: stats } = await supabase
    .from('channel_leaderboard')
    .select('video_count, total_ratings, avg_rating')
    .or(`id.eq.${decodedId},id.eq.@${decodedId},id.eq.${channel.id}`)
    .maybeSingle()

  const title = `${channelName} | Trawlist`
  const description = stats?.avg_rating 
    ? `${channelName} has an average rating of ${Number(stats.avg_rating).toFixed(1)}★ across ${stats.video_count || 0} videos on Trawlist.`
    : `Explore community video ratings and reviews for ${channelName} on Trawlist.`
  const imageUrl = channel.thumbnail_url || '/og-banner.jpg'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.trawlist.com/channel/${params.channelId}`,
      siteName: 'Trawlist',
      images: [
        {
          url: imageUrl,
          width: 500,
          height: 500,
          alt: channelName,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function ChannelPage(props: Props) {
  const params = await props.params
  const decodedId = decodeURIComponent(params.channelId)
  const supabase = await createClient()

  const channel = await resolveChannel(supabase, decodedId)

  if (!channel) {
    notFound()
  }

  const channelName = channel.name || channel.title || decodedId

  // Fetch channel aggregated stats
  const { data: stats } = await supabase
    .from('channel_leaderboard')
    .select('video_count, total_ratings, avg_rating')
    .or(`id.eq.${decodedId},id.eq.@${decodedId},id.eq.${channel.id}`)
    .maybeSingle()

  // Fetch videos for this channel, ordered by average rating
  const { data: videos } = await supabase
    .from('video_leaderboard')
    .select('*')
    .or(`channel_id.eq.${decodedId},channel_id.eq.@${decodedId},channel_id.eq.${channel.id},channel.ilike.${decodedId},channel.ilike.${channelName}`)
    .order('avg_rating', { ascending: false })

  // Fetch current user likes and logs if logged in
  const { data: { session } } = await supabase.auth.getSession()
  let userLikes = new Set<string>()
  let userLogged = new Set<string>()
  let userReviewed = new Set<string>()
  
  if (session && videos) {
    const videoIds = videos.map((v: any) => v.id)
    if (videoIds.length > 0) {
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('video_id, liked, review')
        .eq('user_id', session.user.id)
        .in('video_id', videoIds)
        
      if (ratingsData) {
        userLikes = new Set(ratingsData.filter((r: any) => r.liked).map((l: any) => l.video_id))
        userLogged = new Set(ratingsData.map((r: any) => r.video_id))
        userReviewed = new Set(ratingsData.filter((r: any) => r.review && r.review.trim().length > 0).map((r: any) => r.video_id))
      }
    }
  }

  return (
    <div className="pt-8 px-4 pb-16 max-w-6xl mx-auto">
      {/* Channel Header */}
      <div className="bg-surface border border-amber rounded-xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left shadow-sm">
        {channel.thumbnail_url ? (
          <img 
            src={channel.thumbnail_url} 
            alt={channelName} 
            className="w-32 h-32 rounded-full border-4 border-surface-alt shadow-xl shrink-0 object-cover" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-surface-alt flex items-center justify-center text-4xl font-bold border-4 border-surface shadow-xl shrink-0 text-amber">
            {channelName.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="flex-1 mt-2">
          <h1 className="text-3xl font-extrabold text-ink mb-2">{channelName}</h1>
          <p className="text-muted font-mono text-sm mb-6">{channel.id || decodedId}</p>
          
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
            {videos.map((v: any, index: number) => (
              <VideoGridCard 
                key={v.id}
                title={v.title}
                channel={v.channel}
                channelId={v.channel_id}
                channelThumbnail={v.channel_thumbnail_url || channel.thumbnail_url}
                thumbnail={v.thumbnail_url}
                url={`/?v=${v.id}`}
                rating={v.avg_rating ? Number(v.avg_rating) : null}
                count={v.rating_count}
                rank={index + 1}
                liked={userLikes.has(v.id)}
                isLogged={userLogged.has(v.id)}
                hasUserReviewed={userReviewed.has(v.id)}
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
