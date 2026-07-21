import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileTabs } from '@/components/ProfileTabs'
import { FollowButton } from '@/components/FollowButton'
import { FollowCounts } from '@/components/FollowCounts'

export default async function ProfileLayout(props: {
  children: React.ReactNode
  params: Promise<{ username: string }>
}) {
  const params = await props.params
  const children = props.children
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username.toLowerCase())
    .single()

  if (!profile) {
    notFound()
  }

  // Fetch all ratings for header stats
  const { data: allRatings } = await supabase
    .from('ratings')
    .select('rating')
    .eq('user_id', profile.id)
    .not('rating', 'is', null)

  let totalRatings = 0
  let avgRating = 0

  if (allRatings && allRatings.length > 0) {
    totalRatings = allRatings.length
    const sum = allRatings.reduce((acc, r) => acc + Number(r.rating), 0)
    avgRating = sum / totalRatings
  }

  // Fetch followers/following counts
  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
  ])

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-surface p-6 rounded-xl relative">
        <div className="w-24 h-24 flex-shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover border-2 border-border" />
          ) : (
            <div className="w-full h-full rounded-full bg-surface-alt border-2 flex items-center justify-center text-3xl font-bold">
              {profile.display_name?.[0]?.toUpperCase() || profile.username[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="text-center md:text-left min-w-0 flex-1">
          <h1 className="text-2xl font-display font-bold leading-tight">
            {profile.display_name || profile.username}
          </h1>
          <div className="text-muted text-sm mb-3">@{profile.username}</div>
          {profile.bio && (
            <p className="text-sm text-ink max-w-lg leading-relaxed whitespace-pre-wrap mb-4">{profile.bio}</p>
          )}
          <FollowCounts 
            profileId={profile.id}
            username={profile.username}
            followersCount={followersCount || 0}
            followingCount={followingCount || 0}
          />
          {!isOwnProfile && user && (
            <div className="mt-4">
              <FollowButton targetUserId={profile.id} />
            </div>
          )}
        </div>
        <div className="flex gap-6 text-center md:text-right shrink-0">
          <div>
            <div className="text-2xl font-display font-bold">{totalRatings}</div>
            <div className="text-xs text-muted font-medium uppercase tracking-wider">Ratings</div>
          </div>
          {totalRatings > 0 && (
            <div>
              <div className="text-2xl font-display font-bold text-amber">{avgRating.toFixed(1)}</div>
              <div className="text-xs text-muted font-medium uppercase tracking-wider">Average</div>
            </div>
          )}
        </div>
      </div>

      <ProfileTabs username={profile.username} />

      <div>{children}</div>
    </div>
  )
}
