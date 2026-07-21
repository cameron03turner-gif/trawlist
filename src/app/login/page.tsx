'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    setStatus(error ? 'error' : 'sent')
  }

  if (status === 'sent') {
    return (
      <div className="text-sm text-center py-10">
        Check <span className="text-amber">{email}</span> for a sign-in link.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-3 py-10">
      <h2 className="font-display text-xl font-bold text-center mb-1">Sign in</h2>
      <p className="text-sm text-muted text-center mb-4">No password — we&apos;ll email you a link.</p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-lg px-3 py-2.5 text-sm bg-surface outline-none focus:border-amber"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full py-2.5 rounded-lg text-sm font-semibold bg-amber text-bg disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send sign-in link'}
      </button>
      {status === 'error' && <p className="text-sm text-rec text-center">Something went wrong. Try again.</p>}
    </form>
  )
}
