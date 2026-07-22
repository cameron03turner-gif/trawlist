'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'

export function ListControls() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'recent') // 'recent', 'popular'
  const [network, setNetwork] = useState(searchParams.get('network') || 'community') // 'community', 'following'

  useEffect(() => {
    const timeout = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams()
        if (query) params.set('q', query)
        if (sort && sort !== 'recent') params.set('sort', sort)
        if (network && network !== 'community') params.set('network', network)
        
        const qs = params.toString()
        router.push(qs ? `/lists?${qs}` : `/lists`)
      })
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, sort, network, router])

  return (
    <div className="space-y-3 mb-6 bg-surface p-3 rounded-xl">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
          <Search size={16} className="text-ink" />
        </div>
        <input
          type="text"
          className="block w-full rounded-lg pl-10 pr-10 py-2.5 bg-bg border border-amber outline-none focus:border-amber text-sm placeholder:text-muted transition"
          placeholder="Search for lists by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isPending && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <div className="w-4 h-4 border-2 border-muted border-t-amber rounded-full animate-spin" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="aero-toggle mb-2 sm:mb-0">
          {[
            { id: 'recent', label: 'Recent' },
            { id: 'popular', label: 'Popular' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSort(tab.id)}
              data-active={sort === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="aero-toggle mb-2 sm:mb-0 max-w-xs shrink-0">
          <button
            onClick={() => setNetwork('community')}
            data-active={network === 'community'}
          >
            Community
          </button>
          <button
            onClick={() => setNetwork('following')}
            data-active={network === 'following'}
          >
            Following
          </button>
        </div>
      </div>
    </div>
  )
}
