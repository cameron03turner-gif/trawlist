'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, X } from 'lucide-react'
import { ExportDataButton } from '@/components/ExportDataButton'
import { WatchHistoryImporter } from '@/components/WatchHistoryImporter'

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

  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState<string>('')

  const [form, setForm] = useState({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: '',
  })

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: cleanUsername,
        display_name: form.display_name.trim() || null,
        bio: form.bio.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
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
      router.refresh()
    }
    setSaving(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Username <span className="text-rec">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full rounded-lg pl-8 pr-3 py-2 text-sm bg-bg border border-border outline-none focus:border-amber"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Display Name</label>
              <input
                type="text"
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm bg-bg border border-border outline-none focus:border-amber"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink">Avatar URL</label>
            <input
              type="url"
              value={form.avatar_url}
              onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              className="w-full rounded-lg px-3 py-2 text-sm bg-bg border border-border outline-none focus:border-amber"
            />
            <p className="text-xs text-muted">Paste a link to an image. File uploads coming soon.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              placeholder="A short bio about your tastes..."
              className="w-full rounded-lg px-3 py-2 text-sm bg-bg border border-border outline-none focus:border-amber resize-none"
            />
          </div>

          {error && <div className="text-sm text-rec">{error}</div>}
          {success && <div className="text-sm text-green-500">{success}</div>}

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-amber text-bg disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className="bg-surface rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-1">Account details</h2>
          <p className="text-sm text-muted mb-4">Manage your authentication and account status.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Email</label>
              <div className="text-sm text-muted bg-bg border border-border rounded-lg px-3 py-2 cursor-not-allowed">
                {email}
              </div>
            </div>
            <div>
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-surface-alt border border-border text-ink hover:bg-surface transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <h2 className="text-lg font-medium mb-1">Data Ownership</h2>
          <p className="text-sm text-muted mb-4">Export a copy of all your ratings, reviews, and watch statuses.</p>
          <ExportDataButton />
        </div>

        <div className="pt-6 border-t border-border">
          <WatchHistoryImporter />
        </div>

        <div className="pt-6 border-t border-border">
          <h2 className="text-lg font-medium text-rec mb-1">Delete Account</h2>
          <p className="text-sm text-muted mb-4">Deleting your account is permanent and cannot be undone.</p>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-rec/10 text-rec border border-rec/20 hover:bg-rec/20 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md relative shadow-xl">
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
                    onClick={() => setDeleteMessage('Account deletion requires support action in the current beta. Please contact support@scrubbed.app')}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-rec text-white hover:brightness-110 transition-colors"
                  >
                    Yes, delete my account
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
