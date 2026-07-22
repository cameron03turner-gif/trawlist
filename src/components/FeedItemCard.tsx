import Link from 'next/link'
import { Star, MessageSquare, Plus, ListVideo, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { BaseVideoCardWrapper } from './BaseVideoCard'
import { ListCard } from './ListCard'
import { Avatar } from './Avatar'

type Props = {
  item: any
}

export function FeedItemCard({ item }: Props) {
  const { type, user, data, timestamp } = item
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true })

  if (type === 'rating') {
    const { rating, review, watch_status, video } = data
    
    let actionText = 'rated a video'
    if (rating === null) {
      if (watch_status === 'want_to_watch') actionText = 'wants to watch'
      else if (watch_status === 'watching') actionText = 'is watching'
      else if (watch_status === 'dropped') actionText = 'dropped'
    } else if (review) {
      actionText = 'reviewed a video'
    }

    return (
      <div className="bg-surface border border-amber rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-amber/10 transition-all duration-300 hover:scale-[1.02] hover:brightness-110">
        <div className="p-4 flex items-center justify-between bg-surface/50">
          <div className="flex items-center space-x-3">
            <Link href={`/u/${user.username}`}>
              <Avatar 
                url={user.avatar_url} 
                username={user.username} 
                displayName={user.display_name} 
                className="w-10 h-10 hover:ring-2 hover:ring-amber transition-all text-lg" 
              />
            </Link>
            <div>
              <Link href={`/u/${user.username}`} className="font-semibold text-ink hover:text-amber">
                {user.display_name || user.username}
              </Link>
              <span className="text-muted ml-1.5 text-sm">{actionText}</span>
            </div>
          </div>
          <span className="text-xs text-muted">{timeAgo}</span>
        </div>

        <div className="p-4">
          <BaseVideoCardWrapper
            layout="grid"
            title={video.title}
            channel={video.channel}
            channelThumbnail={video.channel_thumbnail_url}
            thumbnail={video.thumbnail_url}
            url={`/?v=${video.id}`}
          />
        </div>

        {(rating !== null || review) && (
          <div className="p-5 bg-bg/30 border-t border-amber/30">
            {rating !== null && (
              <div className="flex items-center mb-3">
                <div className="flex items-center text-amber bg-amber/10 px-2 py-1 rounded">
                  <Star fill="currentColor" size={16} className="mr-1.5" />
                  <span className="font-bold">{rating}</span>
                  <span className="text-muted ml-1">/ 5</span>
                </div>
              </div>
            )}
            
            {review && (
              <div className="text-ink text-sm italic leading-relaxed border-l-2 border-amber/30 pl-4 mt-2">
                "{review}"
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (type === 'list_created') {
    const { title, description, is_ranked, id, is_private, items, items_count } = data
    return (
      <div className="bg-surface border border-amber rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-amber/10 transition-all duration-300 hover:scale-[1.02] hover:brightness-110">
        <div className="p-4 flex items-center justify-between bg-surface/50">
          <div className="flex items-center space-x-3">
            <Link href={`/u/${user.username}`}>
              <Avatar 
                url={user.avatar_url} 
                username={user.username} 
                displayName={user.display_name} 
                className="w-10 h-10 hover:ring-2 hover:ring-amber transition-all text-lg" 
              />
            </Link>
            <div>
              <Link href={`/u/${user.username}`} className="font-semibold text-ink hover:text-amber">
                {user.display_name || user.username}
              </Link>
              <span className="text-muted ml-1.5 text-sm">created a new list</span>
            </div>
          </div>
          <span className="text-xs text-muted">{timeAgo}</span>
        </div>
        <div className="p-4">
          <ListCard 
            list={{ 
              id, 
              title, 
              description, 
              is_private: is_private || false, 
              is_ranked,
              items,
              items_count
            }} 
          />
        </div>
      </div>
    )
  }

  return null
}
