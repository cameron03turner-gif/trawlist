'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  list: {
    id: string
    title: string
    description: string | null
    is_private: boolean
    is_ranked: boolean
  }
  onClose: () => void
}

export function ListSettingsModal({ list, onClose }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(list.title)
  const [description, setDescription] = useState(list.description || '')
  const [isPrivate, setIsPrivate] = useState(list.is_private)
  const [isRanked, setIsRanked] = useState(list.is_ranked)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/lists/${list.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description.trim() || null,
          is_private: isPrivate,
          is_ranked: isRanked
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update settings')
      }

      router.refresh()
      onClose()
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/lists/${list.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete list')
      }
      onClose()
      router.push('/lists')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setDeleting(false)
      setShowConfirmDelete(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-surface border border-amber rounded-2xl shadow-xl flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-display font-bold">List Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 text-muted hover:text-ink rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-amber"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-amber resize-none h-24"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-1">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={e => setIsPrivate(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${isPrivate ? 'bg-amber' : 'bg-surface-alt'}`}>
                  <div className={`absolute top-1 left-1 bg-bg w-4 h-4 rounded-full transition-transform ${isPrivate ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-ink group-hover:text-amber transition-colors">Private List</div>
                <div className="text-xs text-muted">Only you can view this list</div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-1">
                <input
                  type="checkbox"
                  checked={isRanked}
                  onChange={e => setIsRanked(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${isRanked ? 'bg-amber' : 'bg-surface-alt'}`}>
                  <div className={`absolute top-1 left-1 bg-bg w-4 h-4 rounded-full transition-transform ${isRanked ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-ink group-hover:text-amber transition-colors">Ranked List</div>
                <div className="text-xs text-muted">Items are numbered in order of preference</div>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-border flex justify-between items-center gap-3">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              disabled={saving || deleting}
              className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              {deleting ? 'Deleting...' : 'Delete List'}
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving || deleting}
                className="px-4 py-2 font-medium text-ink hover:bg-surface-alt rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || deleting || !title.trim()}
                className="px-6 py-2 bg-amber text-bg font-bold rounded-lg hover:brightness-110 transition shadow-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showConfirmDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-surface border border-amber rounded-2xl shadow-xl flex flex-col p-6 border border-red-500/20">
            <h3 className="text-xl font-bold text-ink mb-2">Delete List?</h3>
            <p className="text-muted text-sm mb-6">
              Are you sure you want to delete this list? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                disabled={deleting}
                className="px-4 py-2 font-medium text-ink hover:bg-surface-alt rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:brightness-110 transition shadow-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
