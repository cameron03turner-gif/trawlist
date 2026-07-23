import { ActivityFeed } from '@/components/ActivityFeed'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Community Activity Feed | Trawlist',
  description: 'See what your friends and video enthusiasts across the Trawlist community are watching, rating, and reviewing.',
  openGraph: {
    title: 'Community Activity Feed | Trawlist',
    description: 'See what your friends and video enthusiasts across the Trawlist community are watching, rating, and reviewing.',
    url: 'https://www.trawlist.com/community',
    siteName: 'Trawlist',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: 'Trawlist Community Feed' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community Activity Feed | Trawlist',
    description: 'See what your friends and video enthusiasts across the Trawlist community are watching, rating, and reviewing.',
    images: ['/og-banner.jpg'],
  },
}

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="pb-16">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-1 font-display">Community</h1>
          <p className="text-sm text-muted">See what your network is watching, rating, and reviewing.</p>
        </div>
        <Link
          href="/guidelines"
          className="text-xs font-semibold text-amber hover:underline bg-amber/10 border border-amber/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 transition hover:brightness-110"
        >
          Community Guidelines &rarr;
        </Link>
      </div>

      <ActivityFeed initialType={user ? 'following' : 'community'} userId={user?.id} />
    </div>
  )
}
