'use client'

import Link from 'next/link'
import { Lock, ListVideo, Heart, Flag } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toggleListLike } from '@/app/actions/list-likes'
import { Avatar } from './Avatar'
import { ReportModal } from './ReportModal'

type List = {
  id: string
  title: string
  description?: string | null
  is_private: boolean
  is_ranked: boolean
  owner?: { username: string; display_name: string; avatar_url?: string | null } | null
  items?: { video: { thumbnail_url: string } }[] | null
  items_count?: { count: number }[] | null
  likes_count?: { count: number }[] | null
}

export function ListCard({ list, initialIsLiked = false }: { list: List, initialIsLiked?: boolean }) {
  const hasItems = list.items && list.items.length > 0;
  const itemCount = list.items_count?.[0]?.count || list.items?.length || 0;
  const initialLikesCount = list.likes_count?.[0]?.count || 0;
  
  const [isHovered, setIsHovered] = useState(false);
  const [shuffleOffset, setShuffleOffset] = useState(0);

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLiking) return;

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
    
    setIsLiking(true);
    try {
      const result = await toggleListLike(list.id);
      if (!result.success) {
        setIsLiked(isLiked);
        setLikesCount(initialLikesCount);
        if (result.error === 'unauthorized') {
          alert('You must be logged in to like a list.');
        }
      }
    } catch (error) {
      setIsLiked(isLiked);
      setLikesCount(initialLikesCount);
    } finally {
      setIsLiking(false);
    }
  };

  useEffect(() => {
    if (!isHovered || !hasItems || list.items!.length <= 1) {
      setShuffleOffset(0);
      return;
    }
    const interval = setInterval(() => {
      setShuffleOffset(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [isHovered, hasItems, list.items]);

  const baseItems = list.items?.slice(0, 4) || [];

  return (
    <div 
      className="block h-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        @keyframes shuffle-out {
          0% { transform: translateY(-12px) scale(1) rotate(0deg); z-index: 20; }
          40% { transform: translateY(calc(-100% - 20px)) scale(1.05) rotate(2deg); z-index: 20; }
          50% { transform: translateY(calc(-100% - 20px)) scale(0.95) rotate(-2deg); z-index: 7; }
          100% { transform: translateY(-12px) scale(1) rotate(0deg); z-index: 7; }
        }
        .animate-shuffle-out {
          animation: shuffle-out 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
      <div className="bg-surface border border-amber rounded-xl hover:shadow-xl hover:shadow-amber/10 hover:brightness-110 transition-all duration-300 hover:scale-[1.02] h-full flex flex-col relative">
        
        {/* Top Thumbnail Stack - Clickable */}
        <Link href={`/lists/${list.id}`} className="relative w-full pt-[84px] shrink-0 flex items-end justify-center block">
          {hasItems ? (
            <div className="relative w-full aspect-video">
              {baseItems.map((item, originalIndex) => {
                const visualIndex = baseItems.length > 1 
                  ? (originalIndex - (shuffleOffset % baseItems.length) + baseItems.length) % baseItems.length
                  : 0;
                const isBackCard = visualIndex === baseItems.length - 1;
                const isAnimatingBack = isBackCard && shuffleOffset > 0;
                return (
                  <div 
                    key={item?.video?.thumbnail_url || originalIndex}
                    className={`absolute inset-x-0 mx-auto rounded-lg overflow-hidden group-hover:-translate-y-3 ${
                      !isBackCard ? 'shadow-[0_-16px_24px_-12px_rgba(0,0,0,0.95)]' : ''
                    } ${isAnimatingBack ? 'animate-shuffle-out' : ''}`}
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      bottom: `${visualIndex * 28}px`,
                      zIndex: 10 - visualIndex,
                      transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s`,
                    }}
                  >
                    {item?.video?.thumbnail_url ? (
                      <img src={item.video.thumbnail_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-surface flex items-center justify-center text-muted">
                        <ListVideo size={32} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted group-hover:text-amber transition-colors group-hover:scale-110 duration-300 min-h-[120px]">
              <ListVideo size={48} />
            </div>
          )}
          
          {list.is_private && (
            <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-sm p-1.5 rounded-full text-white">
              <Lock size={14} />
            </div>
          )}
        </Link>

        <div className="px-4 pb-4 pt-2.5 flex-1 flex flex-col relative">
          <div className="min-w-0 mb-1.5">
            <h3 className="text-lg font-bold text-ink group-hover:text-amber transition-colors leading-tight line-clamp-2">
              <Link href={`/lists/${list.id}`}>
                {list.title}
              </Link>
            </h3>
          </div>
          
          {list.description && (
            <p className="text-sm text-muted line-clamp-3 mb-4">
              {list.description}
            </p>
          )}

          <div className="mt-auto pt-4 flex flex-col gap-3 relative z-20">
            {/* Top row: Metadata */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {list.owner && (
                  <Link 
                    href={`/u/${list.owner.username}`}
                    className="flex items-center gap-2 group/owner shrink-0"
                  >
                    <Avatar 
                      url={list.owner.avatar_url} 
                      username={list.owner.username} 
                      displayName={list.owner.display_name} 
                      className="w-6 h-6 group-hover/owner:ring-2 group-hover/owner:ring-amber transition-all text-[10px]" 
                    />
                    <span className="text-ink font-medium group-hover/owner:text-amber transition-colors truncate">
                      {list.owner.display_name || list.owner.username}
                    </span>
                  </Link>
                )}
                
                <span className="text-muted flex items-center gap-1.5 shrink-0">
                  {itemCount} videos
                </span>
              </div>
              
              <div className="flex items-center text-muted shrink-0 text-sm">
                <span>{list.is_ranked ? 'Ranked' : 'Unranked'}</span>
              </div>
            </div>

            {/* Bottom row: Actions */}
            <div className="flex items-center justify-between pt-3 mt-1">
              <button 
                onClick={handleLikeToggle}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  isLiked 
                    ? 'text-rec hover:brightness-110' 
                    : 'text-muted hover:text-rec'
                }`}
                aria-label={isLiked ? "Unlike list" : "Like list"}
              >
                <Heart size={14} className={isLiked ? "fill-current" : ""} />
                <span className="font-medium">{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsReportOpen(true)
                }}
                className="text-muted hover:text-amber transition-colors p-1"
                title="Report list"
              >
                <Flag size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="list"
        targetId={list.id}
        targetTitle={`List: ${list.title}`}
      />
    </div>
  )
}
