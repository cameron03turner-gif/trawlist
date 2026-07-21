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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Create a List</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              List Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-neutral-600"
              placeholder="e.g., Best Video Essays of 2023"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-neutral-600 resize-none h-24"
              placeholder="What is this list about?"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isRanked"
              checked={isRanked}
              onChange={(e) => setIsRanked(e.target.checked)}
              className="rounded border-neutral-700 text-blue-500 focus:ring-blue-500 bg-neutral-900"
            />
            <label htmlFor="isRanked" className="text-sm text-neutral-300">
              Ranked list (numbered items)
            </label>
          </div>

          <div className="flex items-center space-x-2 pb-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded border-neutral-700 text-blue-500 focus:ring-blue-500 bg-neutral-900"
            />
            <label htmlFor="isPrivate" className="text-sm text-neutral-300">
              Make list private
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="w-full flex items-center justify-center bg-white text-black font-medium py-2 px-4 rounded-md hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Create List'}
          </button>
        </form>
      </div>
    </div>
  )
}
