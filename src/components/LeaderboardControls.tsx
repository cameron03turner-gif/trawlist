'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'

export function LeaderboardControls() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'avg') // 'avg', 'count', 'recent'
  const [minCount, setMinCount] = useState(searchParams.get('min') || '1')
  const [network, setNetwork] = useState(searchParams.get('network') || 'community') // 'community', 'following'

  useEffect(() => {
    const timeout = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams()
        if (query) params.set('q', query)
        if (sort && sort !== 'avg') params.set('sort', sort)
        if (minCount && minCount !== '1') params.set('min', minCount)
        if (network && network !== 'community') params.set('network', network)
        
        const qs = params.toString()
        router.push(qs ? `/videos?${qs}` : `/videos`)
      })
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, sort, minCount, network, router])

  return (
    <div className="space-y-3 mb-6 bg-surface p-3 rounded-xl">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
          <Search size={16} className="text-ink" />
        </div>
        <input
          type="text"
          className="block w-full rounded-lg pl-10 pr-10 py-2.5 bg-bg border border-amber outline-none focus:border-amber text-sm placeholder:text-muted transition"
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
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="aero-toggle mb-2 sm:mb-0">
          {[
            { id: 'avg', label: 'Top Rated' },
            { id: 'count', label: 'Popular' },
            { id: 'recent', label: 'Recently Rated' },
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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-muted font-medium uppercase tracking-wider shrink-0 ml-1">Min Ratings</span>
          <select 
            className="bg-surface border border-amber rounded-xl text-sm font-medium text-ink px-4 py-2 outline-none focus:border-amber focus:ring-1 focus:ring-amber cursor-pointer transition-colors shrink-0"
            value={minCount}
            onChange={(e) => setMinCount(e.target.value)}
          >
            <option value="1">1+ Rating</option>
            <option value="2">2+ Ratings</option>
            <option value="5">5+ Ratings</option>
            <option value="10">10+ Ratings</option>
            <option value="50">50+ Ratings</option>
          </select>
        </div>
      </div>
    </div>

  )
}
