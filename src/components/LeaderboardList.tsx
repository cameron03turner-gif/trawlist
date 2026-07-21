'use client'

import { useState } from 'react'
import { VideoGridCard } from './VideoGridCard'

export function LeaderboardList({ data, userLikes = [], userLogged = [] }: { data: any[], userLikes?: string[], userLogged?: string[] }) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((v: any, i: number) => (
          <VideoGridCard
            key={v.id}
            title={v.title}
            channel={v.channel}
            channelId={v.channel_id}
            channelThumbnail={v.channel_thumbnail_url || (v.channels ? v.channels.thumbnail_url : null)}
            thumbnail={v.thumbnail_url}
            url={v.url}
            rank={i + 1}
            rating={Number(v.avg_rating)}
            count={v.rating_count}
            reviewsCount={v.review_count}
            likesCount={v.likes_count}
            liked={userLikes.includes(v.id)}
            isLogged={userLogged.includes(v.id)}
            detailUrl={`/videos/${v.id}`}
          />
        ))}
      </div>
    </>
  )
}
