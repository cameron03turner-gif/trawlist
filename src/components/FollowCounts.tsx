'use client'

import { useState } from 'react'
import { FollowListModal } from './FollowListModal'

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
      <div className="flex items-center justify-center md:justify-start gap-4 text-sm mt-3">
        <button onClick={() => setModalType('followers')} className="text-muted hover:text-ink transition">
          <strong className="text-ink">{followersCount || 0}</strong> followers
        </button>
        <button onClick={() => setModalType('following')} className="text-muted hover:text-ink transition">
          <strong className="text-ink">{followingCount || 0}</strong> following
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
