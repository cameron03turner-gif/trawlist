'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, X, Upload, Trash2, Download, ExternalLink } from 'lucide-react'
import { ExportDataButton } from '@/components/ExportDataButton'
import { WatchHistoryImporter } from '@/components/WatchHistoryImporter'
import { PasswordInput } from '@/components/PasswordInput'
import { PrivacySettingsSection } from '@/components/PrivacySettingsSection'
import { CHROME_STORE_URL } from '@/lib/constants'

type Profile = { id: string; username: string; display_name: string | null; bio: string | null; avatar_url: string | null }

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState<string>('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: '',
  })

  useEffect(() => {
    loadData()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true)
      }
    })
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const checkUsername = async () => {
      // Don't check if username is the same as the original profile username
      if (profile && form.username === profile.username) {
        setUsernameAvailable(null)
        setCheckingUsername(false)
        return
      }

      const cleanUsername = form.username.trim().toLowerCase()
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
      if (form.username) checkUsername()
      else setUsernameAvailable(null)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [form.username, supabase, profile])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setEmail(user.email || '')
      setProfile(profileData)
      setForm({
        username: profileData.username || '',
        display_name: profileData.display_name || '',
        bio: profileData.bio || '',
        avatar_url: profileData.avatar_url || '',
      })
    }

    setLoading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.')
        return
      }
      setError('')
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setError('')
    setSuccess('')

    const cleanUsername = form.username.trim().toLowerCase()
    if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
      setError('Username must be 3-20 characters, letters, numbers, and underscores only.')
      setSaving(false)
      return
    }

    let finalAvatarUrl = form.avatar_url.trim() || null

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `${profile.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError('Failed to upload image. Please make sure the avatars storage bucket is set up in Supabase.')
        setSaving(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      finalAvatarUrl = publicUrlData.publicUrl
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: cleanUsername,
        display_name: form.display_name.trim() || null,
        bio: form.bio.trim() || null,
        avatar_url: finalAvatarUrl,
      })
      .eq('id', profile.id)

    if (updateError) {
      if (updateError.code === '23505') {
        setError('That username is already taken.')
      } else {
        setError('Failed to update profile.')
      }
    } else {
      setSuccess('Profile updated successfully.')
      setAvatarFile(null)
      setForm(prev => ({ ...prev, avatar_url: finalAvatarUrl || '' }))
      window.location.reload()
    }
    setSaving(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!isRecoveryMode && !currentPassword) {
      setPasswordError('Please enter your current password.')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setUpdatingPassword(true)
    setPasswordError('')
    setPasswordSuccess('')

    if (!isRecoveryMode) {
      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      })

      if (signInError) {
        setPasswordError('Incorrect current password.')
        setUpdatingPassword(false)
        return
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsRecoveryMode(false)
    }
    setUpdatingPassword(false)
  }

  async function handleSendResetEmail() {
    setSendingReset(true)
    setPasswordError('')
    setPasswordSuccess('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/login`,
    })
    if (error) {
      setPasswordError(error.message)
    } else {
      setResetEmailSent(true)
    }
    setSendingReset(false)
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true)
    setDeleteMessage('')
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setDeleteMessage(data.error || 'Failed to delete account.')
        setDeletingAccount(false)
        return
      }
      window.location.href = '/'
    } catch (err: any) {
      setDeleteMessage(err.message || 'An error occurred.')
      setDeletingAccount(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold mb-1">Settings</h1>
      </div>

      <div className="bg-surface rounded-xl p-6">
        <h2 className="text-lg font-medium mb-4">Edit Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-6 pt-2">
            {/* Left: Avatar, Upload controls & Save button */}
            <div className="flex flex-col items-center sm:items-start justify-between gap-4 shrink-0 sm:w-36">
              <div className="flex flex-col items-center sm:items-start gap-3 w-full">
                <div className="relative w-32 h-32 !rounded-full overflow-hidden bg-bg border-2 border-amber/40 shadow-md shrink-0" style={{ borderRadius: '9999px' }}>
                  {(avatarPreview || form.avatar_url) ? (
                    <img
                      src={avatarPreview || form.avatar_url}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover !rounded-full"
                      style={{ borderRadius: '9999px' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted font-bold text-4xl !rounded-full" style={{ borderRadius: '9999px' }}>
                      {form.username ? form.username.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 w-32">
                  <label className="flex-1 px-2.5 py-1.5 bg-surface-alt hover:bg-surface border border-amber hover:border-amber rounded-lg text-xs font-semibold text-ink cursor-pointer transition-all flex items-center justify-center gap-1.5 min-w-0">
                    <Upload size={14} className="text-amber shrink-0" />
                    <span className="truncate">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {(avatarPreview || form.avatar_url) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarFile(null)
                        setAvatarPreview(null)
                        setForm({ ...form, avatar_url: '' })
                      }}
                      className="p-1.5 text-muted hover:text-rec bg-bg rounded-lg border border-transparent hover:border-rec/30 hover:bg-rec/10 transition-colors shrink-0 shadow-sm"
                      title="Remove picture"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || (usernameAvailable === false && form.username !== profile?.username)}
                className="w-32 py-2 rounded-lg text-sm font-semibold bg-amber text-bg disabled:opacity-60 hover:brightness-110 transition-all shadow-sm"
              >
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>

            {/* Right: Username & Display Name stacked vertically */}
            <div className="flex-1 w-full space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink flex justify-between">
                  <span>Username <span className="text-rec">*</span></span>
                  <span className="text-xs text-muted flex gap-2 items-center">
                    {usernameAvailable === false && <span className="text-rec font-medium">Taken</span>}
                    {usernameAvailable === true && <span className="text-green-500 font-medium">Available</span>}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className={`w-full rounded-lg pl-8 pr-10 py-2 text-sm bg-bg border outline-none focus:border-amber transition-colors ${
                      usernameAvailable === false ? 'border-rec' : 
                      usernameAvailable === true ? 'border-green-500' : 
                      'border-amber/30'
                    }`}
                  />
                  {checkingUsername && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs">...</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-medium text-ink">Display Name</label>
                  <span className="text-xs text-muted">{form.display_name.length}/50</span>
                </div>
                <input
                  type="text"
                  maxLength={50}
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm bg-bg border border-amber outline-none focus:border-amber"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  placeholder="A short bio about your tastes..."
                  className="w-full rounded-lg px-3 py-2.5 text-sm bg-bg border border-amber outline-none focus:border-amber resize-none"
                />
              </div>
            </div>
          </div>

          {error && <div className="text-sm text-rec">{error}</div>}
          {success && <div className="text-sm text-green-500">{success}</div>}
        </form>
      </div>

      <div className="bg-surface rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-1">Account details</h2>
          <p className="text-sm text-muted mb-4">Manage your authentication and account status.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Email</label>
              <div className="text-sm text-muted bg-bg border border-amber rounded-lg px-3 py-2 cursor-not-allowed">
                {email}
              </div>
            </div>
            <div>
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-surface-alt border border-amber text-ink hover:bg-surface transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-amber/30">
          <h2 className="text-lg font-medium mb-1">Update Password</h2>
          <p className="text-sm text-muted mb-4">Set a new password for your account.</p>
          
          {resetEmailSent ? (
            <div className="p-4 bg-surface-alt border border-amber rounded-lg text-sm max-w-sm">
              We&apos;ve sent a password reset link to <span className="font-semibold text-amber">{email}</span>. Please check your inbox to securely set your password.
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-sm">
              {isRecoveryMode && (
                <div className="p-3 bg-amber/10 border border-amber/20 rounded-lg text-amber-900 text-xs font-medium">
                  Recovery mode active. You can set a new password without providing your current one.
                </div>
              )}
              {!isRecoveryMode && (
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-sm font-medium text-ink">Current Password</label>
                    <button 
                      type="button" 
                      onClick={handleSendResetEmail}
                      disabled={sendingReset}
                      className="text-xs text-muted hover:text-ink underline disabled:opacity-50"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <PasswordInput
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-ink mb-1">New Password</label>
                <PasswordInput
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Confirm New Password</label>
                <PasswordInput
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {passwordError && <div className="text-sm text-rec">{passwordError}</div>}
              {passwordSuccess && <div className="text-sm text-green-500">{passwordSuccess}</div>}
              <button 
                type="submit"
                disabled={updatingPassword}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-surface-alt border border-amber text-ink hover:bg-surface transition-colors disabled:opacity-60"
              >
                {updatingPassword ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}
        </div>

        <PrivacySettingsSection />

        <div className="pt-6 border-t border-amber/30">
          <h2 className="text-lg font-medium mb-1">Data Ownership</h2>
          <p className="text-sm text-muted mb-4">Export a copy of all your ratings, reviews, and watch statuses.</p>
          <ExportDataButton />
        </div>

        <div className="pt-6 border-t border-amber/30">
          <WatchHistoryImporter />
        </div>

        <div className="pt-6 border-t border-amber/30 space-y-3">
          <h2 className="text-lg font-medium text-ink flex items-center gap-2">
            Chrome Extension
          </h2>
          <p className="text-sm text-muted">Rate and review YouTube videos directly while watching on YouTube.</p>
          <div className="flex items-center gap-3 flex-wrap pt-1">
            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-amber text-bg hover:brightness-110 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Download size={15} />
              <span>Get Chrome Extension</span>
              <ExternalLink size={13} />
            </a>
            <Link
              href="/extension"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-surface-alt border border-amber/30 text-ink hover:bg-surface hover:text-amber transition-colors"
            >
              View Extension Details
            </Link>
          </div>
        </div>

        <div className="pt-6 border-t border-amber/30 space-y-2">
          <h2 className="text-lg font-medium text-ink">Support & Legal</h2>
          <p className="text-sm text-muted mb-3">Report issues, track bug fixes, or review our Community Guidelines, Terms of Service, and Privacy Policy.</p>
          <div className="flex items-center gap-4 text-sm font-semibold flex-wrap">
            <Link href="/bug-report" className="text-amber hover:underline flex items-center gap-1">Report a Bug / Feedback</Link>
            <span className="text-muted">•</span>
            <Link href="/extension" className="text-amber hover:underline">Chrome Extension</Link>
            <span className="text-muted">•</span>
            <Link href="/guidelines" className="text-amber hover:underline">Community Guidelines</Link>
            <span className="text-muted">•</span>
            <Link href="/terms" className="text-amber hover:underline">Terms of Service</Link>
            <span className="text-muted">•</span>
            <Link href="/privacy" className="text-amber hover:underline">Privacy Policy</Link>
          </div>
        </div>

        <div className="pt-6 border-t border-amber/30">
          <h2 className="text-lg font-medium text-rec mb-1">Delete Account</h2>
          <p className="text-sm text-muted mb-4">Deleting your account is permanent and cannot be undone.</p>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-rec text-bg hover:brightness-110 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <div className="bg-surface border border-amber rounded-xl p-6 w-full max-w-md relative shadow-xl">
            <button 
              onClick={() => { setShowDeleteConfirm(false); setDeleteMessage(''); }}
              className="absolute top-4 right-4 text-muted hover:text-ink"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-ink mb-2">Delete Account?</h2>
            {deleteMessage ? (
              <div className="p-4 bg-amber/10 border border-amber/20 rounded-lg text-amber-900 text-sm">
                {deleteMessage}
              </div>
            ) : (
              <>
                <p className="text-muted text-sm mb-6">
                  Are you sure you want to delete your account? All your ratings, reviews, lists, and follows will be permanently erased. This cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-surface-alt hover:bg-border text-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-rec text-white hover:brightness-110 transition-colors disabled:opacity-60 flex items-center gap-2"
                  >
                    {deletingAccount && <Loader2 size={16} className="animate-spin" />}
                    {deletingAccount ? 'Deleting…' : 'Yes, delete my account'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
