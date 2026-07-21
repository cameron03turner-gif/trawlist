import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FollowButton } from '@/components/FollowButton'
import { Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FollowingPage(props: { params: Promise<{ username: string }> }) {
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
      following:profiles!follows_following_id_fkey(id, username, display_name, avatar_url, bio)
    `)
    .eq('follower_id', profile.id)
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-ink mb-6">Following</h2>

      {!follows || follows.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-border">
          <Users className="mx-auto text-muted mb-4" size={32} />
          <h3 className="text-lg font-medium text-ink mb-2">Not following anyone</h3>
          <p className="text-muted">
            When {profile.display_name || profile.username} follows people, they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {follows.map((f: any) => {
            const followingUser = f.following
            if (!followingUser) return null
            return (
              <div key={followingUser.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                <Link href={`/u/${followingUser.username}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                  {followingUser.avatar_url ? (
                    <img src={followingUser.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 border border-border/50" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center text-lg font-bold shrink-0 border border-border/50 text-ink">
                      {followingUser.display_name?.[0]?.toUpperCase() || followingUser.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-ink truncate group-hover:text-amber transition-colors">
                      {followingUser.display_name || followingUser.username}
                    </div>
                    <div className="text-sm text-muted truncate">@{followingUser.username}</div>
                  </div>
                </Link>
                {user && user.id !== followingUser.id && (
                  <div className="shrink-0">
                    <FollowButton targetUserId={followingUser.id} />
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
