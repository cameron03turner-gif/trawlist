import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VideoGridCard } from '@/components/VideoGridCard'
import { Film } from 'lucide-react'
import Link from 'next/link'

import { FavoritesSection } from '@/components/FavoritesSection'

export const revalidate = 0

export async function generateMetadata(props: { params: Promise<{ username: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('username', params.username.toLowerCase())
    .single()

  const name = profile?.display_name || profile?.username || params.username
  return {
    title: `${name}'s Profile | Trawlist`,
  }
}

export default async function ProfilePage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username.toLowerCase())
    .single()

  if (!profile) {
    notFound()
  }

  const { data: { session } } = await supabase.auth.getSession()
  const isOwnProfile = session?.user?.id === profile.id

  // 2. Fetch Favorites
  const { data: favsData } = await supabase
    .from('profile_favourites')
    .select('position, videos(*, channels(thumbnail_url))')
    .eq('profile_id', profile.id)
    .order('position', { ascending: true })

  const favorites = new Array(4).fill(null)
  if (favsData) {
    favsData.forEach((f: any) => {
      if (f.videos) {
        f.videos.channel_thumbnail_url = f.videos.channels?.thumbnail_url
      }
      favorites[f.position - 1] = f.videos
    })
  }

  // 3. Fetch Recent Public Ratings
  const { data: rawRatingsData } = await supabase
    .from('ratings')
    .select('*, videos(*, channels(thumbnail_url))')
    .eq('user_id', profile.id)
    .order('updated_at', { ascending: false })
    .limit(20)

  const ratingsData = (rawRatingsData || []).filter((r: any) => 
    r.rating != null || (r.review && r.review.trim() !== '') || (r.note && r.note.trim() !== '') || r.watch_status === 'watched'
  )

  // 4. Fetch All Ratings for Stats
  const { data: allRatings } = await supabase
    .from('ratings')
    .select('rating, videos(channel)')
    .eq('user_id', profile.id)
    .not('rating', 'is', null)

  let totalRatings = 0
  let avgRating = 0
  const distribution: Record<string, number> = {}
  const channelCounts: Record<string, number> = {}

  if (allRatings && allRatings.length > 0) {
    totalRatings = allRatings.length
    let sum = 0
    allRatings.forEach(r => {
      const rating = Number(r.rating)
      sum += rating
      // distribution
      const rStr = rating.toFixed(1)
      distribution[rStr] = (distribution[rStr] || 0) + 1
      // channel
      const channel = (r.videos as any)?.channel
      if (channel) {
         channelCounts[channel] = (channelCounts[channel] || 0) + 1
      }
    })
    avgRating = sum / totalRatings
  }

  const topChannels = Object.entries(channelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const maxDist = Math.max(...Object.values(distribution), 1)
  const ratingBuckets = ['0.5','1.0','1.5','2.0','2.5','3.0','3.5','4.0','4.5','5.0']

  return (
    <div className="space-y-8">

      <FavoritesSection 
        favorites={favorites} 
        isOwnProfile={isOwnProfile} 
        profileId={profile.id} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">

          {/* Recent Log */}
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-muted font-semibold">Recent Log</h2>
            {ratingsData && ratingsData.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {ratingsData.map((r: any) => (
                  <VideoGridCard
                    key={r.videos.id}
                    title={r.videos.title}
                    channel={r.videos.channel}
                    channelId={r.videos.channel_id}
                    channelThumbnail={r.videos.channels?.thumbnail_url}
                    thumbnail={r.videos.thumbnail_url}
                    url={r.videos.url}
                    rating={r.rating}
                    review={r.review}
                    liked={!!r.liked}
                    isLogged={r.rating != null}
                    watchStatus={r.watch_status}
                    editUrl={isOwnProfile ? `?logUrl=${encodeURIComponent(r.videos.url)}` : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-surface border border-amber rounded-xl">
                <Film className="mx-auto text-muted mb-4" size={32} />
                <h3 className="text-lg font-medium text-ink mb-2">No videos yet</h3>
                <p className="text-muted mb-6">
                  {isOwnProfile 
                    ? "You haven't logged any videos yet." 
                    : `${profile.display_name || profile.username} hasn't rated any videos yet.`}
                </p>
                {isOwnProfile && (
                  <Link 
                    href="/?logUrl="
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-amber text-bg hover:brightness-110 transition"
                  >
                    Rate your first video
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-8">
          {totalRatings > 0 && (
            <div className="space-y-3 bg-surface p-5 pb-6 rounded-xl">
              <h2 className="text-xs uppercase tracking-widest text-muted font-semibold mb-4">Rating Distribution</h2>
              <div className="flex h-32 gap-1">
                {ratingBuckets.map(bucket => {
                  const count = distribution[bucket] || 0
                  const heightPct = maxDist > 0 ? (count / maxDist) * 100 : 0
                  return (
                    <div key={bucket} className="flex flex-col items-center flex-1 gap-1 group h-full">
                      <div className="w-full bg-surface-alt rounded-sm relative flex items-end justify-center flex-1 overflow-hidden">
                        <div 
                          className="w-full bg-amber rounded-sm transition-all group-hover:brightness-110" 
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-muted font-mono transform -rotate-45 origin-top-left mt-2">
                        {bucket}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {topChannels.length > 0 && (
            <div className="space-y-3 bg-surface p-5 rounded-xl">
              <h2 className="text-xs uppercase tracking-widest text-muted font-semibold">Top Channels</h2>
              <div className="space-y-3">
                {topChannels.map(([channel, count], idx) => (
                  <div key={channel} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-xs font-mono text-muted w-4">{idx + 1}</span>
                      <span className="text-sm font-medium truncate">{channel}</span>
                    </div>
                    <span className="text-xs text-muted shrink-0 bg-bg px-2 py-0.5 rounded-full border border-amber">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
