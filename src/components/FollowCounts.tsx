'use client'

import { useState } from 'react'
import { FollowListModal } from './FollowListModal'

import { Users, UserCheck } from 'lucide-react'

type Props = {
  profileId: string
  username: string
  followersCount: number
  followingCount: number
}

export function FollowCounts({ profileId, username, followersCount, followingCount }: Props) {
  const [modalType, setModalType] = useState<'followers' | 'following' | null>(null)

  return (
    <>
      <div className="flex flex-col gap-1 w-full text-sm">
        <button 
          onClick={() => setModalType('followers')} 
          className="text-muted hover:text-amber transition flex items-center justify-between w-full group" 
          title="Followers"
        >
          <span className="font-medium text-sm text-muted group-hover:text-amber transition-colors">Followers</span>
          <strong className="text-ink font-display font-bold text-sm">{followersCount || 0}</strong>
        </button>
        <button 
          onClick={() => setModalType('following')} 
          className="text-muted hover:text-amber transition flex items-center justify-between w-full group" 
          title="Following"
        >
          <span className="font-medium text-sm text-muted group-hover:text-amber transition-colors">Following</span>
          <strong className="text-ink font-display font-bold text-sm">{followingCount || 0}</strong>
        </button>
      </div>

      {modalType && (
        <FollowListModal 
          profileId={profileId}
          username={username}
          type={modalType} 
          onClose={() => setModalType(null)} 
        />
      )}
    </>
  )
}
