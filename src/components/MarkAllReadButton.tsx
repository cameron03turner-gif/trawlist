'use client'

import { markAllNotificationsAsRead } from '@/app/actions/notifications'
import { useState } from 'react'
import { CheckCheck } from 'lucide-react'

export function MarkAllReadButton() {
  const [loading, setLoading] = useState(false)

  return (
    <button
      onClick={async () => {
        setLoading(true)
        await markAllNotificationsAsRead()
        setLoading(false)
      }}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-surface hover:bg-surface-alt border border-border rounded-md text-muted hover:text-ink transition disabled:opacity-50"
    >
      <CheckCheck size={14} />
      Mark all read
    </button>
  )
}
