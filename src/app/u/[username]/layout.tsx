import Link from 'next/link'
import { Film, MessageSquare, ListVideo, Clock, Heart, Star } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileTabs } from '@/components/ProfileTabs'
import { FollowButton } from '@/components/FollowButton'
import { FollowCounts } from '@/components/FollowCounts'
import { Avatar } from '@/components/Avatar'

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

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  // Fetch all ratings for header stats (rating, review, liked, watch_status)
  const { data: allRatings } = await supabase
    .from('ratings')
    .select('rating, review, liked, watch_status')
    .eq('user_id', profile.id)

  let totalRatings = 0
  let avgRating = 0
  let reviewsCount = 0
  let likesCount = 0
  let watchlistCount = 0

  if (allRatings && allRatings.length > 0) {
    const ratedItems = allRatings.filter(r => r.rating !== null && r.rating !== undefined)
    totalRatings = ratedItems.length
    if (totalRatings > 0) {
      const sum = ratedItems.reduce((acc, r) => acc + Number(r.rating), 0)
      avgRating = sum / totalRatings
    }
    reviewsCount = allRatings.filter(r => r.review && r.review.trim().length > 0).length
    likesCount = allRatings.filter(r => !!r.liked).length
    watchlistCount = allRatings.filter(r => r.watch_status === 'want_to_watch').length
  }

  // Fetch followers/following/lists counts
  const [{ count: followersCount }, { count: followingCount }, { count: listsCount }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    isOwnProfile
      ? supabase.from('custom_lists').select('*', { count: 'exact', head: true }).eq('owner_id', profile.id)
      : supabase.from('custom_lists').select('*', { count: 'exact', head: true }).eq('owner_id', profile.id).eq('is_private', false)
  ])

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-surface p-6 rounded-xl relative border border-amber">
        <div className="flex flex-col items-center md:items-start gap-2 shrink-0 w-24">
          <div className="w-24 h-24">
            <Avatar 
              url={profile.avatar_url} 
              username={profile.username} 
              displayName={profile.display_name} 
              className="w-full h-full border-2 border-amber/30 text-3xl" 
            />
          </div>
          <FollowCounts 
            profileId={profile.id}
            username={profile.username}
            followersCount={followersCount || 0}
            followingCount={followingCount || 0}
          />
          {!isOwnProfile && user && (
            <div className="mt-1 w-full">
              <FollowButton targetUserId={profile.id} />
            </div>
          )}
        </div>

        <div className="text-center md:text-left min-w-0 flex-1">
          <h1 className="text-2xl font-display font-bold leading-tight">
            {profile.display_name || profile.username}
          </h1>
          <div className="text-muted text-sm mb-3">@{profile.username}</div>
          {profile.bio && (
            <p className="text-sm text-ink max-w-lg leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          )}
        </div>

        {/* Icon Stat Counters - Vertically Stacked & Indented */}
        <div className="aero-inset flex flex-col gap-3 shrink-0 p-5 min-w-[180px]">
          <Link 
            href={`/u/${profile.username}/log`}
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-2 text-muted group-hover:text-amber transition-colors">
              <Star size={16} />
              <span className="text-sm font-medium">Ratings</span>
            </div>
            <span className="text-base font-display font-bold text-ink">{totalRatings}</span>
          </Link>

          <Link 
            href={`/u/${profile.username}/diary`}
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-2 text-muted group-hover:text-amber transition-colors">
              <MessageSquare size={16} />
              <span className="text-sm font-medium">Reviews</span>
            </div>
            <span className="text-base font-display font-bold text-ink">{reviewsCount}</span>
          </Link>

          <Link 
            href={`/u/${profile.username}/lists`}
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-2 text-muted group-hover:text-amber transition-colors">
              <ListVideo size={16} />
              <span className="text-sm font-medium">Lists</span>
            </div>
            <span className="text-base font-display font-bold text-ink">{listsCount || 0}</span>
          </Link>

          {totalRatings > 0 && (
            <Link 
              href={`/u/${profile.username}/stats`}
              className="flex items-center justify-between group mt-2 pt-2 border-t border-border/50"
            >
              <div className="flex items-center gap-2 text-amber">
                <Star size={16} className="fill-amber" />
                <span className="text-sm font-medium">Average</span>
              </div>
              <span className="text-base font-display font-bold text-amber">{avgRating.toFixed(1)}</span>
            </Link>
          )}
        </div>
      </div>

      <ProfileTabs username={profile.username} />

      <div>{children}</div>
    </div>
  )
}
