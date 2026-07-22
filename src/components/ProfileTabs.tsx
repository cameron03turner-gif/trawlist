'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function ProfileTabs({ username }: { username: string }) {
  const pathname = usePathname()
  
  const tabs = [
    { name: 'Profile', href: `/u/${username}`, exact: true },
    { name: 'Log', href: `/u/${username}/log`, exact: false },
    { name: 'Diary', href: `/u/${username}/diary`, exact: false },
    { name: 'Lists', href: `/u/${username}/lists`, exact: false },
    { name: 'Watchlist', href: `/u/${username}/watchlist`, exact: false },
    { name: 'Stats', href: `/u/${username}/stats`, exact: false },
  ]

  return (
    <div className="w-full border-b border-border/40 mb-8">
      <div className="flex items-center gap-6 text-sm font-medium -mb-px">
        {tabs.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname?.startsWith(tab.href)
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`pb-3 border-b-2 transition hover:text-amber ${
                isActive 
                  ? 'border-amber text-amber font-bold' 
                  : 'border-transparent text-muted'
              }`}
            >
              {tab.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
