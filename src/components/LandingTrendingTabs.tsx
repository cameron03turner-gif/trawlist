'use client'

import { useState } from 'react'
import { VideoGridCard } from '@/components/VideoGridCard'
import { ListCard } from '@/components/ListCard'
import { Avatar } from '@/components/Avatar'
import { Star, ListVideo, MessageSquare, Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type Props = {
  topVideos: any[]
  popularLists: any[]
  recentReviews: any[]
}

export function LandingTrendingTabs({ topVideos, popularLists, recentReviews }: Props) {
  const [tab, setTab] = useState<'videos' | 'lists' | 'reviews'>('videos')

  return (
    <div className="py-10 bg-transparent border-t border-amber/20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold font-display text-ink mb-1">Community Highlights</h2>
            <p className="text-sm text-muted">Explore what video essay and film lovers are discussing right now.</p>
          </div>

          <div className="flex items-center bg-bg/80 border border-amber/30 p-1 rounded-xl">
            <button
              onClick={() => setTab('videos')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                tab === 'videos' ? 'bg-amber text-bg shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <Star size={14} className={tab === 'videos' ? 'fill-bg' : ''} />
              Trending Videos
            </button>

            <button
              onClick={() => setTab('lists')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                tab === 'lists' ? 'bg-amber text-bg shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <ListVideo size={14} />
              Top Lists
            </button>

            <button
              onClick={() => setTab('reviews')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                tab === 'reviews' ? 'bg-amber text-bg shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <MessageSquare size={14} />
              Recent Reviews
            </button>
          </div>
        </div>

        {/* Tab 1: Trending Videos */}
        {tab === 'videos' && (
          <div className="animate-in fade-in-0 duration-300">
            {topVideos.length === 0 ? (
              <p className="text-muted text-center py-12">No trending videos found.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {topVideos.map(v => (
                  <VideoGridCard 
                    key={v.id || v.video_id}
                    title={v.title}
                    channel={v.channel}
                    channelId={v.channel_id}
                    channelThumbnail={v.channel_thumbnail_url}
                    thumbnail={v.thumbnail_url}
                    url={v.url}
                    detailUrl={`/videos/${v.id || v.video_id}`}
                    rating={v.avg_rating ? Number(v.avg_rating) : null}
                    count={v.rating_count || 0}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Popular Lists */}
        {tab === 'lists' && (
          <div className="animate-in fade-in-0 duration-300">
            {popularLists.length === 0 ? (
              <p className="text-muted text-center py-12">No curated lists found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {popularLists.map(l => (
                  <ListCard key={l.id} list={l} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Recent Reviews */}
        {tab === 'reviews' && (
          <div className="animate-in fade-in-0 duration-300">
            {recentReviews.length === 0 ? (
              <p className="text-muted text-center py-12">No recent reviews found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentReviews.map(r => (
                  <div
                    key={r.id}
                    className="bg-surface-alt p-5 rounded-xl border border-amber/40 shadow-sm hover:scale-[1.01] transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar
                            url={r.profiles?.avatar_url}
                            username={r.profiles?.username}
                            displayName={r.profiles?.display_name}
                            className="w-8 h-8 text-xs shrink-0"
                          />
                          <div>
                            <Link href={`/u/${r.profiles?.username}`} className="font-bold text-sm text-ink hover:text-amber transition block leading-snug">
                              {r.profiles?.display_name || r.profiles?.username || 'Community Member'}
                            </Link>
                            <span className="text-xs text-muted block">@{r.profiles?.username}</span>
                          </div>
                        </div>
                        {r.rating && (
                          <div className="flex items-center gap-1 bg-bg px-2.5 py-1 rounded-full border border-amber/30">
                            <Star size={14} className="fill-amber text-amber" />
                            <span className="text-xs font-bold text-amber">{Number(r.rating).toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-ink line-clamp-3 leading-relaxed">
                        "{r.review}"
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs text-muted">
                      <span>on video essay</span>
                      <Link
                        href={`/videos/${r.video_id}`}
                        className="text-amber hover:underline font-semibold flex items-center gap-1"
                      >
                        View Discussion <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* View All CTA Button */}
        <div className="text-center mt-6">
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-surface-alt border border-amber text-ink hover:bg-amber hover:text-bg hover:scale-105 transition-all shadow-md"
          >
            Explore Full Leaderboard <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
