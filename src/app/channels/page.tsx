import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, Film, Star } from 'lucide-react'

import { Metadata } from 'next'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Top Creators & Channels | Trawlist',
  description: 'Discover the highest-rated YouTube channels and creators ranked by community video ratings.',
  openGraph: {
    title: 'Top Creators & Channels | Trawlist',
    description: 'Discover the highest-rated YouTube channels and creators ranked by community video ratings.',
    url: 'https://www.trawlist.com/channels',
    siteName: 'Trawlist',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: 'Top YouTube Creators on Trawlist' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top Creators & Channels | Trawlist',
    description: 'Discover the highest-rated YouTube channels and creators ranked by community video ratings.',
    images: ['/og-banner.jpg'],
  },
}

export default async function ChannelsLeaderboardPage() {
  const supabase = await createClient()

  const { data: channels } = await supabase
    .from('channel_leaderboard')
    .select('*')
    .order('avg_rating', { ascending: false })
    .order('total_ratings', { ascending: false })

  return (
    <div className="pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2">Top Channels</h1>
        <p className="text-muted">The highest-rated YouTube creators on Trawlist, ranked by their average video rating.</p>
        <p className="text-xs text-muted/70 mt-1">Requires a minimum of 2 rated videos to qualify.</p>
      </div>

      <div className="bg-surface border border-amber rounded-xl overflow-hidden shadow-sm">
        {channels && channels.length > 0 ? (
          <div className="divide-y divide-border/50">
            {channels.map((channel, index) => (
              <Link 
                key={channel.id} 
                href={`/channel/${encodeURIComponent(channel.id)}`}
                className="flex flex-col sm:flex-row items-start sm:items-center p-4 hover:bg-surface-alt transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-8 text-center font-mono font-bold text-muted group-hover:text-amber transition-colors shrink-0">
                    {index + 1}
                  </div>
                  
                  {channel.thumbnail_url ? (
                    <img 
                      src={channel.thumbnail_url} 
                      alt={channel.name}
                      className="w-12 h-12 rounded-full border border-amber/50 object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-surface-alt border border-amber/50 flex items-center justify-center font-bold text-lg text-amber shrink-0">
                      {channel.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 pr-4">
                    <h2 className="text-lg font-bold text-ink truncate group-hover:text-amber transition-colors">
                      {channel.name}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-muted mt-1">
                      <span className="flex items-center gap-1">
                        <Film size={12} /> {channel.video_count} videos
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={12} /> {channel.total_ratings} ratings
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 sm:ml-auto flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex-1 sm:hidden h-px bg-border/50" />
                  <div className="bg-amber/10 text-amber font-mono font-bold text-xl px-4 py-2 rounded-lg shadow-sm">
                    {Number(channel.avg_rating).toFixed(2)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted">
            No channels have reached the minimum qualification threshold yet.
          </div>
        )}
      </div>
    </div>
  )
}
