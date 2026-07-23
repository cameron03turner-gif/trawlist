import { ActivityFeed } from '@/components/ActivityFeed'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

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
