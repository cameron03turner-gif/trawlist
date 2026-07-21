import { ActivityFeed } from '@/components/ActivityFeed'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2">Community</h1>
        <p className="text-muted">See what your network is watching, rating, and reviewing.</p>
      </div>

      <ActivityFeed initialType={user ? 'following' : 'community'} userId={user?.id} />
    </div>
  )
}
