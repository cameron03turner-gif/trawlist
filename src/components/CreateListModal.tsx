'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  onClose: () => void
}

export function CreateListModal({ onClose }: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isRanked, setIsRanked] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, is_private: isPrivate, is_ranked: isRanked })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create list')
      }

      router.refresh()
      router.push(`/lists/${data.list.id}`)
      onClose()
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-surface border border-amber/30 rounded-2xl shadow-xl p-6 animate-fade-in-zoom">
        <button
          onClick={onClose}
          className="p-2 text-muted hover:text-amber hover:bg-surface-alt bg-bg/80 rounded-full transition-colors shrink-0"
          title="Close"
        >
          <X size={16} />
        </button>

        <h2 className="text-xl font-bold text-ink mb-6">Create a List</h2>

        {error && (
          <div className="mb-4 p-3 bg-rec/10 border border-rec/20 rounded-lg text-rec text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              List Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-bg border border-amber rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-amber transition-colors"
              placeholder="e.g., Best Video Essays of 2023"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-bg border border-amber rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-amber transition-colors resize-none h-24"
              placeholder="What is this list about?"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isRanked"
              checked={isRanked}
              onChange={(e) => setIsRanked(e.target.checked)}
              className="accent-amber"
            />
            <label htmlFor="isRanked" className="text-sm text-ink cursor-pointer">
              Ranked list (numbered items)
            </label>
          </div>

          <div className="flex items-center space-x-2 pb-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="accent-amber"
            />
            <label htmlFor="isPrivate" className="text-sm text-ink cursor-pointer">
              Make list private
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="w-full flex items-center justify-center bg-amber text-bg font-semibold py-2.5 px-4 rounded-lg hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Create List'}
          </button>
        </form>
      </div>
    </div>
  )
}
