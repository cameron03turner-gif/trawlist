'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Link as LinkIcon, ListVideo, Trophy, Play, LogOut, Settings, Users, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from '@/components/NotificationBell'
import { Avatar } from '@/components/Avatar'

const TABS = [
  { href: '?log=true', label: 'Log', icon: LinkIcon, highlight: true },
  { href: '/videos', label: 'Videos', icon: Play },
  { href: '/channels', label: 'Channels', icon: Users },
  { href: '/community', label: 'Community', icon: Trophy },
  { href: '/lists', label: 'Lists', icon: ListVideo },
]

export function NavBar({ userEmail, profile }: { userEmail: string | null; profile?: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="aero-navbar border-b border-border bg-bg/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8 h-full">
          <Link href="/" className="flex items-center gap-3 group/logo">
            <Image 
              src="/logo.png" 
              alt="Trawlist Logo" 
              width={32} 
              height={32} 
              className="group-hover/logo:scale-110 transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(32,208,192,0.4)]"
            />
            <span className="font-display font-bold text-xl tracking-tight text-ink group-hover/logo:text-amber transition-colors duration-300">TRAWLIST</span>
          </Link>
          
          <nav className="flex items-center gap-4 h-full">
            {TABS.map((t) => {
              const Icon = t.icon
              const active = pathname === t.href
              
              if (t.highlight) {
                if (!userEmail) {
                  return (
                    <Link
                      key="/login"
                      href="/login"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold bg-amber text-bg rounded-md hover:brightness-110 transition shadow-sm"
                    >
                      <LogIn size={14} /> Sign in
                    </Link>
                  )
                }
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold bg-amber text-bg rounded-md hover:brightness-110 transition shadow-sm"
                  >
                    <Icon size={14} /> {t.label}
                  </Link>
                )
              }
              
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`flex items-center gap-1.5 h-full px-1 text-sm font-medium border-b-2 transition ${
                    active ? 'text-amber border-amber' : 'text-muted border-transparent hover:text-ink hover:border-border'
                  }`}
                >
                  <Icon size={15} /> {t.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div>
          {userEmail ? (
            <div className="flex items-center gap-4">
              {profile?.username ? (
                <Link href={`/u/${profile.username}`} className="flex items-center gap-2 text-sm font-medium hover:text-amber transition">
                  <Avatar 
                    url={profile.avatar_url} 
                    username={profile.username} 
                    displayName={profile.display_name} 
                    className="w-6 h-6 text-[10px]" 
                  />
                  {profile.display_name || profile.username}
                </Link>
              ) : (
                <span className="text-xs text-muted">{userEmail}</span>
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
  )
}
