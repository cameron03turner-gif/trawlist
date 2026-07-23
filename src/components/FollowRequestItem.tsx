'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserPlus, Check, X, Loader2 } from 'lucide-react'
import { acceptFollowRequest, declineFollowRequest } from '@/app/actions/follow-requests'
import { Avatar } from './Avatar'

type Props = {
  notificationId: string
  actor: {
    id: string
    username: string
    display_name?: string | null
    avatar_url?: string | null
  }
}

export function FollowRequestItem({ actor }: Props) {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending')
  const [loading, setLoading] = useState(false)

  const handleAccept = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)

    const res = await acceptFollowRequest(actor.id)
    if (res.ok) {
      setStatus('accepted')
    } else {
      alert(res.error || 'Failed to accept follow request.')
    }
    setLoading(false)
  }

  const handleDecline = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)

    const res = await declineFollowRequest(actor.id)
    if (res.ok) {
      setStatus('declined')
    } else {
      alert(res.error || 'Failed to decline follow request.')
    }
    setLoading(false)
  }

  if (status === 'accepted') {
    return (
      <div className="p-3 bg-amber/10 border border-amber/30 rounded-xl text-xs text-amber font-semibold flex items-center justify-between">
        <span>You accepted @{actor.username}&apos;s follow request.</span>
        <Check size={16} />
      </div>
    )
  }

  if (status === 'declined') {
    return (
      <div className="p-3 bg-surface-alt border border-amber/20 rounded-xl text-xs text-muted flex items-center justify-between">
        <span>Declined follow request from @{actor.username}.</span>
        <X size={16} />
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
      <div className="flex items-center gap-2">
        <Link href={`/u/${actor.username}`} onClick={(e) => e.stopPropagation()}>
          <Avatar
            url={actor.avatar_url}
            username={actor.username}
            displayName={actor.display_name}
            className="w-7 h-7 text-[10px]"
          />
        </Link>
        <span className="text-xs text-ink">
          <Link href={`/u/${actor.username}`} className="font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
            {actor.display_name || actor.username}
          </Link>{' '}
          wants to follow your private profile.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
        <button
          onClick={handleAccept}
          disabled={loading}
          className="flex-1 sm:flex-initial px-3 py-1.5 bg-amber text-bg font-bold text-xs rounded-xl hover:brightness-110 transition flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          <span>Accept</span>
        </button>

        <button
          onClick={handleDecline}
          disabled={loading}
          className="flex-1 sm:flex-initial px-3 py-1.5 bg-surface-alt border border-amber/30 text-ink font-semibold text-xs rounded-xl hover:bg-surface-alt/80 hover:text-amber transition flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <X size={13} />
          <span>Decline</span>
        </button>
      </div>
    </div>
  )
}
