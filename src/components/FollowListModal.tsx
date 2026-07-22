'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Users } from 'lucide-react'
import Link from 'next/link'
import { FollowButton } from './FollowButton'
import { Avatar } from './Avatar'

type Props = {
  profileId: string
  username: string
  type: 'followers' | 'following'
  onClose: () => void
}

export function FollowListModal({ profileId, username, type, onClose }: Props) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (mounted) setCurrentUser(user)

      if (type === 'followers') {
        const { data } = await supabase
          .from('follows')
          .select('follower:profiles!follows_follower_id_fkey(id, username, display_name, avatar_url, bio)')
          .eq('following_id', profileId)
          .order('created_at', { ascending: false })
          
        if (mounted && data) {
          setUsers(data.map((d: any) => d.follower).filter(Boolean))
        }
      } else {
        const { data } = await supabase
          .from('follows')
          .select('following:profiles!follows_following_id_fkey(id, username, display_name, avatar_url, bio)')
          .eq('follower_id', profileId)
          .order('created_at', { ascending: false })
          
        if (mounted && data) {
          setUsers(data.map((d: any) => d.following).filter(Boolean))
        }
      }
      if (mounted) setLoading(false)
    }
    
    load()
    return () => { mounted = false }
  }, [profileId, type])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-surface border border-amber rounded-2xl shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-amber/30">
          <h2 className="text-lg font-bold text-ink capitalize">{type}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-muted hover:text-ink bg-bg rounded-full border border-amber transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 border-2 border-muted border-t-amber rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <Users className="mx-auto mb-3 opacity-50" size={32} />
              <p>{type === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between gap-3 p-2 hover:bg-surface-alt rounded-xl transition-colors group">
                  <Link href={`/u/${u.username}`} onClick={onClose} className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar
                      url={u.avatar_url}
                      username={u.username}
                      displayName={u.display_name}
                      className="w-10 h-10 border border-amber/50 shrink-0 text-ink"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-ink truncate group-hover:text-amber transition-colors">
                        {u.display_name || u.username}
                      </div>
                      <div className="text-xs text-muted truncate">@{u.username}</div>
                    </div>
                  </Link>
                  {currentUser && currentUser.id !== u.id && (
                    <div className="shrink-0">
                      <FollowButton targetUserId={u.id} className="!px-3 !py-1.5 !text-xs" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
