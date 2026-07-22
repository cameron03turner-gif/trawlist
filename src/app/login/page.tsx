'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogIn, UserPlus, X, Loader2, KeyRound } from 'lucide-react'
import { PasswordInput } from '@/components/PasswordInput'

type AuthMode = 'signin' | 'signup'

export default function LoginPage() {
  const supabase = createClient()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [resetError, setResetError] = useState('')

  // Recovery Mode State (when coming from email reset link)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const [recoveryPassword, setRecoveryPassword] = useState('')
  const [recoveryConfirm, setRecoveryConfirm] = useState('')
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [recoveryError, setRecoveryError] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      })
      if (error) {
        setErrorMessage(error.message)
        setStatus('error')
      } else if (data?.session) {
        // Auto-confirmed by Supabase (Confirm Email is OFF in dashboard)
        window.location.href = '/'
      } else if (data?.user && data?.user?.identities && data.user.identities.length === 0) {
        // Account already exists in Supabase Auth
        setErrorMessage('An account with this email address already exists. Please sign in instead.')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setErrorMessage(error.message)
        setStatus('error')
      } else {
        window.location.href = '/'
      }
    }
  }

  async function handleSendReset(e: React.FormEvent) {
    e.preventDefault()
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address.')
      setResetStatus('error')
      return
    }
    setResetStatus('loading')
    setResetError('')
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${location.origin}/login`,
    })
    if (error) {
      setResetError(error.message)
      setResetStatus('error')
    } else {
      setResetStatus('success')
    }
  }

  async function handleSetNewPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!recoveryPassword || recoveryPassword.length < 6) {
      setRecoveryError('Password must be at least 6 characters.')
      setRecoveryStatus('error')
      return
    }
    if (recoveryPassword !== recoveryConfirm) {
      setRecoveryError('Passwords do not match.')
      setRecoveryStatus('error')
      return
    }

    setRecoveryStatus('loading')
    setRecoveryError('')

    const { error } = await supabase.auth.updateUser({
      password: recoveryPassword,
    })

    if (error) {
      setRecoveryError(error.message)
      setRecoveryStatus('error')
    } else {
      setRecoveryStatus('success')
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    }
  }

  function openForgotModal() {
    setResetEmail(email)
    setResetStatus('idle')
    setResetError('')
    setShowForgotModal(true)
  }

  if (isRecoveryMode) {
    return (
      <div className="max-w-sm mx-auto py-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber/10 text-amber rounded-full flex items-center justify-center mx-auto mb-3 border border-amber/20">
            <KeyRound size={24} />
          </div>
          <h2 className="font-display text-2xl font-bold">Set New Password</h2>
          <p className="text-sm text-muted">Please enter your new account password below.</p>
        </div>

        {recoveryStatus === 'success' ? (
          <div className="bg-surface p-6 rounded-2xl border border-amber text-center space-y-2">
            <p className="text-green-500 font-semibold text-base">Password updated successfully!</p>
            <p className="text-xs text-muted">Redirecting you to the home page…</p>
          </div>
        ) : (
          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">New Password</label>
                <PasswordInput
                  required
                  value={recoveryPassword}
                  onChange={(e) => setRecoveryPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl px-4 py-3 text-sm bg-surface border border-amber outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Confirm New Password</label>
                <PasswordInput
                  required
                  value={recoveryConfirm}
                  onChange={(e) => setRecoveryConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full rounded-xl px-4 py-3 text-sm bg-surface border border-amber outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-all"
                />
              </div>
            </div>

            {recoveryStatus === 'error' && (
              <div className="bg-rec/10 border border-rec/20 rounded-lg p-3 text-center">
                <p className="text-sm text-rec">{recoveryError || 'Failed to update password.'}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={recoveryStatus === 'loading'}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-amber text-bg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {recoveryStatus === 'loading' && <Loader2 size={16} className="animate-spin" />}
              {recoveryStatus === 'loading' ? 'Saving…' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-sm text-center py-10 max-w-sm mx-auto space-y-4">
        <div className="bg-surface p-6 rounded-2xl border border-amber">
          <h2 className="font-display text-xl font-bold mb-2">Check your email</h2>
          <p className="text-muted">
            We sent you a confirmation link to finish setting up your account.
          </p>
          <p className="text-amber mt-4 font-medium">{email}</p>
        </div>
        <button 
          onClick={() => { setStatus('idle'); setMode('signin') }}
          className="text-sm text-muted hover:text-ink underline"
        >
          Back to log in
        </button>
      </div>
    )
  }



  return (
    <div className="max-w-sm mx-auto py-10 space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold mb-2">Welcome</h2>
        <p className="text-sm text-muted">Sign in or create an account to continue.</p>
      </div>



      <div className="aero-toggle w-full">
        <button
          type="button"
          onClick={() => setMode('signin')}
          data-active={mode === 'signin'}
          className="flex items-center justify-center gap-2 flex-1 text-xs sm:text-sm"
        >
          <LogIn size={14} /> Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          data-active={mode === 'signup'}
          className="flex items-center justify-center gap-2 flex-1 text-xs sm:text-sm"
        >
          <UserPlus size={14} /> Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl px-4 py-3 text-sm bg-surface border border-amber outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-all"
          />
          <div>
            <PasswordInput
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl px-4 py-3 text-sm bg-surface border border-amber outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-all"
            />
            {mode === 'signin' && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={openForgotModal}
                  className="text-xs text-muted hover:text-amber transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-3 rounded-xl text-sm font-semibold bg-amber text-bg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:active:scale-100 disabled:hover:brightness-100"
        >
          {status === 'loading' ? 'Loading…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>

        {status === 'error' && (
          <div className="bg-rec/10 border border-rec/20 rounded-lg p-3 text-center">
            <p className="text-sm text-rec">{errorMessage || 'Something went wrong. Try again.'}</p>
          </div>
        )}
      </form>

      <div className="pt-2 text-center text-xs text-muted flex items-center justify-center gap-3">
        <Link href="/terms" className="hover:text-amber transition-colors">Terms of Service</Link>
        <span>•</span>
        <Link href="/privacy" className="hover:text-amber transition-colors">Privacy Policy</Link>
      </div>

      {/* Forgot Password Modal Overlay */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-amber rounded-2xl p-6 w-full max-w-md relative shadow-xl space-y-4">
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-ink transition-colors"
            >
              <X size={20} />
            </button>

            <div>
              <h2 className="text-xl font-bold text-ink">Reset Password</h2>
              <p className="text-sm text-muted mt-1">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {resetStatus === 'success' ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber/10 border border-amber/20 rounded-xl text-sm">
                  <p className="font-semibold text-ink">Reset link sent!</p>
                  <p className="text-muted mt-1">
                    Check <span className="text-amber font-medium">{resetEmail}</span> for instructions to set your new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-surface-alt border border-amber text-ink hover:bg-surface transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl px-4 py-3 text-sm bg-bg border border-amber outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-all"
                  />
                </div>

                {resetStatus === 'error' && (
                  <div className="bg-rec/10 border border-rec/20 rounded-lg p-3 text-center">
                    <p className="text-sm text-rec">{resetError || 'Failed to send reset email.'}</p>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-surface-alt hover:bg-border text-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={resetStatus === 'loading'}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber text-bg hover:brightness-110 transition-colors disabled:opacity-60 flex items-center gap-2"
                  >
                    {resetStatus === 'loading' && <Loader2 size={16} className="animate-spin" />}
                    {resetStatus === 'loading' ? 'Sending…' : 'Send reset link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


