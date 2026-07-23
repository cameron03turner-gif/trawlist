'use client'

import { useState } from 'react'
import { Edit2, Plus } from 'lucide-react'
import { FavoritePickerModal } from './FavoritePickerModal'
import { BaseVideoCardWrapper } from './BaseVideoCard'

export function FavoritesSection({ 
  favorites, 
  isOwnProfile, 
  profileId 
}: { 
  favorites: any[]
  isOwnProfile: boolean
  profileId: string 
}) {
  const [editingPosition, setEditingPosition] = useState<number | null>(null)

  if (!isOwnProfile && !favorites.some(f => f !== null)) {
    return null
  }

  return (
    <>
      <div className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-muted font-semibold">Favourite Videos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {favorites.map((video, idx) => {
            const position = idx + 1
            
            const editButton = isOwnProfile ? (
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setEditingPosition(position)
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/85 text-amber border border-amber/60 hover:bg-amber hover:text-bg rounded-md backdrop-blur-md transition-all shadow-lg opacity-0 group-hover/card:opacity-100 group-hover/thumb:opacity-100 z-20"
                title={video ? "Change favourite" : "Add favourite"}
              >
                {video ? <Edit2 size={14} /> : <Plus size={14} />}
              </button>
            ) : null

            if (!video) {
              return (
                <div key={position} className="flex flex-col h-full group/card relative">
                  <div className="aspect-video bg-surface/50 border-2 border-dashed border-amber/30 hover:shadow-xl hover:shadow-amber/10 hover:border-amber/60 transition-all duration-300 hover:scale-[1.02] hover:bg-surface rounded-lg overflow-hidden relative shrink-0">
                    <div className="w-full h-full flex items-center justify-center text-amber font-medium text-xs opacity-60 group-hover/card:opacity-100 transition-opacity">Empty</div>
                    {editButton}
                  </div>
                </div>
              )
            }

            return (
              <div key={position} className="h-full">
                <BaseVideoCardWrapper
                  layout="grid"
                  title={video.title}
                  channel={video.channel}
                  channelThumbnail={video.channel_thumbnail_url}
                  thumbnail={video.thumbnail_url}
                  url={video.url}
                  hoverMenu={editButton}
                />
              </div>
            )
          })}
        </div>
      </div>

      {editingPosition !== null && (
        <FavoritePickerModal
          profileId={profileId}
          position={editingPosition}
          onClose={() => setEditingPosition(null)}
        />
      )}
    </>
  )
}
