'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function WelcomePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  useEffect(() => {
    const checkUsername = async () => {
      const cleanUsername = username.trim().toLowerCase()
      if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
        setUsernameAvailable(null)
        return
      }
      setCheckingUsername(true)
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', cleanUsername)
        .single()
      
      setUsernameAvailable(!data)
      setCheckingUsername(false)
    }

    const delayDebounceFn = setTimeout(() => {
      if (username) checkUsername()
      else setUsernameAvailable(null)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [username, supabase])

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

    // Hard navigation to ensure server layout refetches profile
    window.location.href = '/?onboarded=true'
  }

  return (
    <div className="max-w-md mx-auto space-y-6 py-10">
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold">Welcome to Trawlist</h1>
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
              maxLength={20}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className={`w-full rounded-lg pl-8 pr-10 py-2.5 text-sm bg-bg border outline-none focus:border-amber transition-colors ${
                usernameAvailable === false ? 'border-rec' : 
                usernameAvailable === true ? 'border-green-500' : 
                'border-border'
              }`}
            />
            {checkingUsername && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs">...</span>}
          </div>
          <p className="text-xs text-muted flex justify-between">
            <span>3-20 characters, letters, numbers, and underscores.</span>
            {usernameAvailable === false && <span className="text-rec font-medium">Taken</span>}
            {usernameAvailable === true && <span className="text-green-500 font-medium">Available</span>}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink">Display Name</label>
          <input
            type="text"
            maxLength={50}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Jane Doe"
            className="w-full rounded-lg px-3 py-2.5 text-sm bg-bg border border-border outline-none focus:border-amber"
          />
          <p className="text-xs text-muted flex justify-end">{displayName.length}/50</p>
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
