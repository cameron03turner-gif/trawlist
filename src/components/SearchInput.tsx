'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const timeout = setTimeout(() => {
      startTransition(() => {
        if (query) {
          router.push(`/leaderboard?q=${encodeURIComponent(query)}`)
        } else {
          router.push(`/leaderboard`)
        }
      })
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, router])

  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
        <Search size={16} className="text-ink" />
      </div>
      <input
        type="text"
        className="block w-full rounded-lg pl-10 pr-3 py-2.5 bg-surface outline-none focus:border-amber text-sm placeholder:text-muted transition"
        placeholder="Search by video title or channel name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isPending && (
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <div className="w-4 h-4 border-2 border-muted border-t-amber rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
