'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Link as LinkIcon, ListVideo, Trophy, Play, LogOut, Settings, Users, LogIn, Search, Tv, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from '@/components/NotificationBell'
import { Avatar } from '@/components/Avatar'
import { GlobalSearchModal } from '@/components/GlobalSearchModal'

const TABS = [
  { href: '?log=true', label: 'Log', icon: Plus, highlight: true },
  { href: '/videos', label: 'Videos', icon: Play },
  { href: '/channels', label: 'Channels', icon: Tv },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/lists', label: 'Lists', icon: ListVideo },
]

export function NavBar({ userEmail, profile }: { userEmail: string | null; profile?: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <>
      <header className="aero-navbar border-b border-amber/30 bg-bg/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 h-full shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group/logo shrink-0">
              <Image 
                src="/logo.png" 
                alt="Trawlist Logo" 
                width={32} 
                height={32} 
                className="group-hover/logo:scale-110 transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(32,208,192,0.4)]"
              />
              <span className="font-display font-bold text-xl tracking-tight text-ink group-hover/logo:text-amber transition-colors duration-300">TRAWLIST</span>
            </Link>
            
            <nav className="flex items-center gap-3.5 h-full">
              {TABS.map((t) => {
                const Icon = t.icon
                const active = pathname === t.href
                
                if (t.highlight) {
                  if (!userEmail) {
                    return (
                      <Link
                        key="/login"
                        href="/login"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-amber text-bg rounded-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm shrink-0 my-auto"
                      >
                        <LogIn size={14} /> Sign in
                      </Link>
                    )
                  }
                  return (
                    <Link
                      key={t.href}
                      href={t.href}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-amber text-bg rounded-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm shrink-0 my-auto"
                    >
                      <Plus size={15} /> Log
                    </Link>
                  )
                }
                
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={`flex items-center gap-1.5 h-full px-1 text-sm font-medium border-b-2 transition ${
                      active ? 'text-amber border-amber' : 'text-muted border-transparent hover:text-ink hover:border-amber/30'
                    }`}
                  >
                    <Icon size={15} /> {t.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3.5 shrink-0">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-muted hover:text-amber transition p-1"
              title="Search"
            >
              <Search size={16} />
            </button>

            {userEmail ? (
              <div className="flex items-center gap-3.5">
                {profile?.username ? (
                  <Link href={`/u/${profile.username}`} className="flex items-center gap-2 text-sm font-medium hover:text-amber transition">
                    <Avatar 
                      url={profile.avatar_url} 
                      username={profile.username} 
                      displayName={profile.display_name} 
                      className="w-6 h-6 text-[10px]" 
                    />
                    <span className="hidden lg:inline">{profile.display_name || profile.username}</span>
                  </Link>
                ) : (
                  <span className="text-xs text-muted hidden lg:inline">{userEmail}</span>
                )}
                {profile && <NotificationBell userId={profile.id} />}
                <Link href="/settings" className="text-muted hover:text-ink transition" title="Settings">
                  <Settings size={15} />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-muted hover:text-rec transition"
                  title="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}


