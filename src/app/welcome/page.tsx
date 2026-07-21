'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function WelcomePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic validation
    const cleanUsername = username.trim().toLowerCase()
    if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
      setError('Username must be 3-20 characters, letters, numbers, and underscores only.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not logged in')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: cleanUsername,
        display_name: displayName.trim() || null,
      })
      .eq('id', user.id)

    if (updateError) {
      if (updateError.code === '23505') { // unique_violation
        setError('That username is already taken.')
      } else {
        setError('Failed to update profile. Please try again.')
      }
      setLoading(false)
      return
    }

    // Force a router refresh so layout fetches the new profile
    router.refresh()
    router.push('/?onboarded=true')
  }

  return (
    <div className="max-w-md mx-auto space-y-6 py-10">
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold">Welcome to Scrubbed</h1>
        <p className="text-sm text-muted">Let&apos;s set up your profile before you start rating.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-surface p-6 rounded-xl">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink">Username <span className="text-rec">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="w-full rounded-lg pl-8 pr-3 py-2.5 text-sm bg-bg border border-border outline-none focus:border-amber"
            />
          </div>
          <p className="text-xs text-muted">3-20 characters, letters, numbers, and underscores.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Jane Doe"
            className="w-full rounded-lg px-3 py-2.5 text-sm bg-bg border border-border outline-none focus:border-amber"
          />
        </div>

        {error && <div className="text-sm text-rec p-3 bg-rec/10 rounded-lg">{error}</div>}

        <button
          type="submit"
          disabled={loading || !username}
          className="w-full py-2.5 rounded-lg text-sm font-semibold bg-amber text-bg disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Complete Setup'}
        </button>
      </form>
    </div>
  )
}
