'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ListSettingsModal } from './ListSettingsModal'
import { EditableListItems } from './EditableListItems'
import { AddToListButton } from './AddToListButton'
import { Settings, Edit2, Heart } from 'lucide-react'
import { toggleListLike } from '@/app/actions/list-likes'

type Props = {
  list: any
  initialItems: any[]
  isOwner: boolean
  initialIsLiked?: boolean
  initialLikesCount?: number
}

export function ListClientContent({ list, initialItems, isOwner, initialIsLiked = false, initialLikesCount = 0 }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLiking, setIsLiking] = useState(false)

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isLiking) return

    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1)
    
    setIsLiking(true)
    try {
      const result = await toggleListLike(list.id)
      if (!result.success) {
        setIsLiked(isLiked)
        setLikesCount(initialLikesCount)
        if (result.error === 'unauthorized') {
          alert('You must be logged in to like a list.')
        }
      }
    } catch (error) {
      setIsLiked(isLiked)
      setLikesCount(initialLikesCount)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <>
      <div className="mb-12 border-b border-amber/30 pb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-ink mb-4">{list.title}</h1>
          {list.description && (
            <p className="text-xl text-ink/90 mb-6 max-w-3xl leading-relaxed">{list.description}</p>
          )}
          
          <div className="flex items-center text-sm text-muted flex-wrap gap-y-2">
            <span className="bg-surface-alt text-ink border border-amber px-3 py-1 rounded-full font-medium">
              {list.is_ranked ? 'Ranked List' : 'List'}
            </span>
            {list.is_private && (
              <span className="ml-3 bg-surface-alt border border-amber text-muted px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Private
              </span>
            )}
            <span className="mx-3">•</span>
            <span>{initialItems?.length || 0} items</span>
            
            {list.owner && (
              <>
                <span className="mx-3">•</span>
                <span>
                  Curated by{' '}
                  <Link href={`/u/${list.owner.username}`} className="text-ink hover:text-amber font-medium transition-colors">
                    {list.owner.display_name || list.owner.username}
                  </Link>
                </span>
              </>
            )}

            <span className="mx-3">•</span>
            <button 
              onClick={handleLikeToggle}
              disabled={isLiking}
              className={`flex items-center gap-1.5 transition-colors ${
                isLiked 
                  ? 'text-rec hover:brightness-110' 
                  : 'text-muted hover:text-rec'
              }`}
            >
              <Heart size={14} className={isLiked ? "fill-current" : ""} />
              <span className="font-medium">{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
            </button>
          </div>
        </div>

        {isOwner && (
          <div className="shrink-0 flex flex-col gap-2 bg-surface p-3 rounded-xl border border-amber/50 shadow-sm min-w-[200px]">
            <AddToListButton listId={list.id} />
            <button
              onClick={() => setShowSettings(true)}
              className="w-full px-4 py-2 text-sm text-left font-bold text-ink hover:bg-surface-alt hover:text-amber transition-colors flex items-center gap-3 rounded-lg"
            >
              <Settings size={16} /> List Settings
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full px-4 py-2 text-sm text-left font-bold text-ink hover:bg-surface-alt hover:text-amber transition-colors flex items-center gap-3 rounded-lg"
            >
              <Edit2 size={16} /> Edit Entries
            </button>
          </div>
        )}
      </div>

      <EditableListItems 
        initialItems={initialItems || []} 
        listId={list.id} 
        isRanked={list.is_ranked} 
        isEditing={isEditing}
        onCancelEdit={() => setIsEditing(false)}
        onSaveSuccess={() => setIsEditing(false)}
      />

      {showSettings && (
        <ListSettingsModal 
          list={list} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </>
  )
}
