import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FollowButton } from '@/components/FollowButton'
import { Users } from 'lucide-react'
import { Avatar } from '@/components/Avatar'

export const dynamic = 'force-dynamic'

export default async function FollowersPage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params
  
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .eq('username', params.username.toLowerCase())
    .single()

  if (!profile) {
    notFound()
  }

  const { data: follows } = await supabase
    .from('follows')
    .select(`
      follower:profiles!follows_follower_id_fkey(id, username, display_name, avatar_url, bio)
    `)
    .eq('following_id', profile.id)
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-ink mb-6">Followers</h2>

      {!follows || follows.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-amber">
          <Users className="mx-auto text-muted mb-4" size={32} />
          <h3 className="text-lg font-medium text-ink mb-2">No followers yet</h3>
          <p className="text-muted">
            When people follow {profile.display_name || profile.username}, they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {follows.map((f: any) => {
            const follower = f.follower
            if (!follower) return null
            return (
              <div key={follower.id} className="bg-surface border border-amber rounded-xl p-4 flex items-center justify-between gap-4">
                <Link href={`/u/${follower.username}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                  <Avatar
                    url={follower.avatar_url}
                    username={follower.username}
                    displayName={follower.display_name}
                    className="w-12 h-12 border border-amber/50 shrink-0 text-ink text-lg"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-ink truncate group-hover:text-amber transition-colors">
                      {follower.display_name || follower.username}
                    </div>
                    <div className="text-sm text-muted truncate">@{follower.username}</div>
                  </div>
                </Link>
                {user && user.id !== follower.id && (
                  <div className="shrink-0">
                    <FollowButton targetUserId={follower.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
