'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, X, Users, Play, ListVideo, Tv, Star, ArrowRight } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { FollowButton } from '@/components/FollowButton'

type Category = 'all' | 'users' | 'videos' | 'lists' | 'channels'

type Props = {
  isOpen: boolean
  onClose: () => void
  initialCategory?: Category
}

export function GlobalSearchModal({ isOpen, onClose, initialCategory = 'all' }: Props) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>(initialCategory)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    users: any[]
    videos: any[]
    lists: any[]
    channels: any[]
    followingIds: string[]
  }>({
    users: [],
    videos: [],
    lists: [],
    channels: [],
    followingIds: [],
  })

  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults({ users: [], videos: [], lists: [], channels: [], followingIds: [] })
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Debounced search query fetching
  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], videos: [], lists: [], channels: [], followingIds: [] })
      setLoading(false)
      return
    }

    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${category}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
        }
      } catch (err) {
        console.error('Failed to fetch search results', err)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timeout)
  }, [query, category])

  if (!isOpen) return null

  const hasUsers = results.users.length > 0
  const hasVideos = results.videos.length > 0
  const hasLists = results.lists.length > 0
  const hasChannels = results.channels.length > 0
  const hasAnyResults = hasUsers || hasVideos || hasLists || hasChannels

  const categories: { id: Category; label: string; icon: any; count?: number }[] = [
    { id: 'all', label: 'All Results', icon: Search },
    { id: 'users', label: 'Users', icon: Users, count: results.users.length },
    { id: 'videos', label: 'Videos', icon: Play, count: results.videos.length },
    { id: 'lists', label: 'Lists', icon: ListVideo, count: results.lists.length },
    { id: 'channels', label: 'Channels', icon: Tv, count: results.channels.length },
  ]

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" 
      style={{ 
        backgroundColor: 'var(--modal-backdrop-bg)', 
        backdropFilter: 'blur(var(--modal-backdrop-blur))', 
        WebkitBackdropFilter: 'blur(var(--modal-backdrop-blur))' 
      }} 
      onClick={onClose}
    >
      <div 
        className="aero-modal relative w-full max-w-2xl bg-surface border border-amber rounded-2xl shadow-[0_0_40px_rgba(32,208,192,0.1)] flex flex-col max-h-[85vh] overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Input Bar */}
        <div className="p-4 flex items-center gap-3 bg-surface-alt/40">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
              <Search size={16} className="text-ink" />
            </div>
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-bg/80 border border-amber/40 rounded-xl pl-9 pr-8 py-2 text-ink text-sm placeholder:text-muted outline-none focus:border-amber transition font-medium"
              placeholder="Search users, videos, lists, or channels..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && !loading && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink transition-colors rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {loading && (
            <div className="w-5 h-5 border-2 border-muted border-t-amber rounded-full animate-spin shrink-0" />
          )}
          {/* Close X Button (matching VideoDetailModal) */}
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-amber hover:bg-surface-alt bg-bg/80 rounded-full transition-colors shrink-0"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter Category Bar ("Show results for") */}
        <div className="px-4 py-2.5 bg-surface-alt/30 flex items-center gap-2 overflow-x-auto [::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider shrink-0 mr-1">
            Show results for:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = category === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber text-bg shadow-md font-bold'
                      : 'bg-surface-alt/80 hover:bg-surface-alt text-muted hover:text-ink'
                  }`}
                >
                  <Icon size={13} />
                  <span>{cat.label}</span>
                  {query && cat.id !== 'all' && cat.count !== undefined && cat.count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-bg/20 text-bg' : 'bg-surface text-amber'}`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!query.trim() && (
            <div className="py-12 text-center text-muted">
              <Search size={36} className="mx-auto mb-3 text-muted/60" />
              <p className="text-sm font-medium">Type a name, @username, video title, or channel to start searching.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                <span className="text-muted">Try searching:</span>
                <button onClick={() => setQuery('Redlyne')} className="px-2.5 py-1 rounded-lg bg-surface-alt text-amber hover:text-ink transition-all">@Redlyne</button>
                <button onClick={() => setQuery('Review')} className="px-2.5 py-1 rounded-lg bg-surface-alt text-amber hover:text-ink transition-all">Lists</button>
                <button onClick={() => setQuery('Games')} className="px-2.5 py-1 rounded-lg bg-surface-alt text-amber hover:text-ink transition-all">Channels</button>
              </div>
            </div>
          )}

          {query.trim() && !loading && !hasAnyResults && (
            <div className="py-12 text-center text-muted">
              <X size={36} className="mx-auto mb-3 text-muted/60" />
              <h4 className="text-base font-bold text-ink mb-1">No matches found</h4>
              <p className="text-sm">We couldn&apos;t find anything matching &quot;{query}&quot; for category &quot;{category}&quot;.</p>
            </div>
          )}

          {/* USERS Category Results */}
          {hasUsers && (category === 'all' || category === 'users') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber flex items-center gap-1.5">
                  <Users size={14} className="text-amber" /> Users ({results.users.length})
                </h3>
                {category === 'all' && results.users.length >= 8 && (
                  <button onClick={() => setCategory('users')} className="text-xs text-amber hover:underline flex items-center gap-1">
                    View all <ArrowRight size={12} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {results.users.map((u) => {
                  const isFollowing = results.followingIds.includes(u.id)
                  return (
                    <div 
                      key={u.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-alt/70 hover:bg-surface-alt transition-colors group"
                    >
                      <Link 
                        href={`/u/${u.username}`} 
                        onClick={onClose}
                        className="flex items-center gap-3 min-w-0 flex-1 pr-2"
                      >
                        <Avatar 
                          url={u.avatar_url} 
                          username={u.username} 
                          displayName={u.display_name} 
                          className="w-10 h-10 shrink-0 text-xs" 
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-ink truncate group-hover:text-amber transition-colors">
                            {u.display_name || u.username}
                          </div>
                          <div className="text-xs text-muted font-mono truncate">
                            @{u.username}
                          </div>
                          {u.bio && (
                            <div className="text-xs text-muted/80 truncate mt-0.5">
                              {u.bio}
                            </div>
                          )}
                        </div>
                      </Link>
                      <FollowButton targetUserId={u.id} initialIsFollowing={isFollowing} />
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* VIDEOS Category Results */}
          {hasVideos && (category === 'all' || category === 'videos') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber flex items-center gap-1.5">
                  <Play size={14} className="text-amber" /> Videos ({results.videos.length})
                </h3>
                {category === 'all' && results.videos.length >= 8 && (
                  <button onClick={() => setCategory('videos')} className="text-xs text-amber hover:underline flex items-center gap-1">
                    View all <ArrowRight size={12} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {results.videos.map((v) => (
                  <Link 
                    key={v.id} 
                    href={`/?v=${v.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-surface-alt/70 hover:bg-surface-alt transition-colors group"
                  >
                    {v.thumbnail_url ? (
                      <img 
                        src={v.thumbnail_url} 
                        alt={v.title} 
                        className="w-16 h-10 object-cover rounded-xl shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-10 rounded-xl bg-surface-alt flex items-center justify-center shrink-0">
                        <Play size={16} className="text-muted" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-ink truncate group-hover:text-amber transition-colors">
                        {v.title}
                      </div>
                      <div className="text-xs text-muted truncate">
                        {v.channel}
                      </div>
                    </div>
                    {v.avg_rating && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber/10 text-amber font-mono font-bold text-xs shrink-0">
                        <Star size={11} className="fill-amber" />
                        <span>{Number(v.avg_rating).toFixed(1)}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* LISTS Category Results */}
          {hasLists && (category === 'all' || category === 'lists') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber flex items-center gap-1.5">
                  <ListVideo size={14} className="text-amber" /> Custom Lists ({results.lists.length})
                </h3>
                {category === 'all' && results.lists.length >= 8 && (
                  <button onClick={() => setCategory('lists')} className="text-xs text-amber hover:underline flex items-center gap-1">
                    View all <ArrowRight size={12} />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {results.lists.map((l) => (
                  <Link 
                    key={l.id} 
                    href={`/lists/${l.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-alt/70 hover:bg-surface-alt transition-colors group"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="font-bold text-sm text-ink truncate group-hover:text-amber transition-colors">
                        {l.title}
                      </div>
                      {l.description && (
                        <div className="text-xs text-muted truncate mt-0.5">
                          {l.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        {l.owner && (
                          <div className="flex items-center gap-1.5 text-xs text-muted">
                            <Avatar 
                              url={l.owner.avatar_url} 
                              username={l.owner.username} 
                              displayName={l.owner.display_name} 
                              className="w-4 h-4 text-[9px]" 
                            />
                            <span>{l.owner.display_name || l.owner.username}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-surface-alt text-xs font-mono text-muted shrink-0">
                      {l.items_count?.[0]?.count || 0} videos
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CHANNELS Category Results */}
          {hasChannels && (category === 'all' || category === 'channels') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber flex items-center gap-1.5">
                  <Tv size={14} className="text-amber" /> Channels ({results.channels.length})
                </h3>
                {category === 'all' && results.channels.length >= 8 && (
                  <button onClick={() => setCategory('channels')} className="text-xs text-amber hover:underline flex items-center gap-1">
                    View all <ArrowRight size={12} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {results.channels.map((c) => (
                  <Link 
                    key={c.id} 
                    href={`/channel/${encodeURIComponent(c.id)}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-alt/70 hover:bg-surface-alt transition-colors group"
                  >
                    {c.thumbnail_url ? (
                      <img 
                        src={c.thumbnail_url} 
                        alt={c.name} 
                        className="w-10 h-10 rounded-full object-cover shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center font-bold text-amber shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-ink truncate group-hover:text-amber transition-colors">
                        {c.name}
                      </div>
                      <div className="text-xs text-muted">
                        {c.total_ratings || 0} ratings
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
