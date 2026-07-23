'use client'

import { useState, useEffect } from 'react'
import { Lock, Shield, Loader2, Check } from 'lucide-react'
import { toggleAccountPrivacy } from '@/app/actions/follow-requests'
import { createClient } from '@/lib/supabase/client'

export function PrivacySettingsSection() {
  const [isPrivate, setIsPrivate] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    async function loadPrivacy() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_private')
          .eq('id', user.id)
          .single()
        if (profile) {
          setIsPrivate(Boolean(profile.is_private))
        }
      }
      setLoading(false)
    }
    loadPrivacy()
  }, [])

  const handleToggle = async () => {
    if (updating) return
    const nextVal = !isPrivate
    setIsPrivate(nextVal)
    setUpdating(true)
    setSuccessMsg(null)

    const res = await toggleAccountPrivacy(nextVal)
    if (res.ok) {
      setSuccessMsg(nextVal ? 'Account set to Private. New followers require approval.' : 'Account set to Public.')
      setTimeout(() => setSuccessMsg(null), 4000)
    } else {
      setIsPrivate(!nextVal)
      alert(res.error || 'Failed to update privacy setting.')
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="pt-6 border-t border-amber/30 space-y-2 animate-pulse">
        <div className="h-5 bg-surface-alt rounded w-48" />
        <div className="h-4 bg-surface-alt rounded w-80" />
      </div>
    )
  }

  return (
    <div className="pt-6 border-t border-amber/30 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-ink flex items-center gap-2">
            <Lock size={18} className="text-amber" /> Private Account
          </h2>
          <p className="text-sm text-muted max-w-xl leading-relaxed">
            When your account is private, only followers you approve can view your ratings log, diary, custom lists, stats, and activity. New follow requests will appear in your notifications for approval.
          </p>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={updating}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber ${
            isPrivate ? 'bg-amber' : 'bg-surface-alt border-amber/30'
          }`}
          role="switch"
          aria-checked={isPrivate}
        >
          <span className="sr-only">Toggle Private Account</span>
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-bg shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
              isPrivate ? 'translate-x-5' : 'translate-x-0'
            }`}
          >
            {updating && <Loader2 size={12} className="animate-spin text-amber" />}
          </span>
        </button>
      </div>

      {successMsg && (
        <div className="text-xs text-amber font-semibold bg-amber/10 border border-amber/30 p-2.5 rounded-xl flex items-center gap-2">
          <Check size={14} />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  )
}
