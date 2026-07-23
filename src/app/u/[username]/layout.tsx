import Link from 'next/link'
import { Film, MessageSquare, ListVideo, Clock, Heart, Star, Lock } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileTabs } from '@/components/ProfileTabs'
import { FollowButton } from '@/components/FollowButton'
import { FollowCounts } from '@/components/FollowCounts'
import { Avatar } from '@/components/Avatar'
import { ProfileReportButton } from '@/components/ProfileReportButton'

import { Metadata } from 'next'

export async function generateMetadata(props: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const params = await props.params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, bio, avatar_url')
    .eq('username', params.username.toLowerCase())
    .single()

  if (!profile) return { title: 'User Not Found | Trawlist' }

  const name = profile.display_name || `@${profile.username}`
  const title = `${name} (@${profile.username})`
  const description = profile.bio || `Check out ${name}'s video diary, ratings, and reviews on Trawlist.`
  const imageUrl = profile.avatar_url || '/og-banner.jpg'

  return {
    title: `${name} | Trawlist`,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.trawlist.com/u/${profile.username}`,
      siteName: 'Trawlist',
      images: [
        {
          url: imageUrl,
          width: 500,
          height: 500,
          alt: `${name}'s Profile`,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

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

  // Check viewer follow status if profile is private
  let isAcceptedFollower = false
  let isPendingFollower = false

  if (profile.is_private && user && !isOwnProfile) {
    const { data: followRel } = await supabase
      .from('follows')
      .select('status')
      .eq('follower_id', user.id)
      .eq('following_id', profile.id)
      .maybeSingle()

    if (followRel) {
      isAcceptedFollower = followRel.status === 'accepted' || !followRel.status
      isPendingFollower = followRel.status === 'pending'
    }
  }

  const canViewContent = isOwnProfile || !profile.is_private || isAcceptedFollower

  // Fetch all ratings for header stats (rating, review, liked, watch_status)
  let totalRatings = 0
  let avgRating = 0
  let reviewsCount = 0
  let listsCount = 0

  if (canViewContent) {
    const { data: allRatings } = await supabase
      .from('ratings')
      .select('rating, review, liked, watch_status')
      .eq('user_id', profile.id)

    if (allRatings && allRatings.length > 0) {
      const ratedItems = allRatings.filter(r => r.rating !== null && r.rating !== undefined)
      totalRatings = ratedItems.length
      if (totalRatings > 0) {
        const sum = ratedItems.reduce((acc, r) => acc + Number(r.rating), 0)
        avgRating = sum / totalRatings
      }
      reviewsCount = allRatings.filter(r => r.review && r.review.trim().length > 0).length
    }

    const { count: lCount } = await supabase
      .from('custom_lists')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', profile.id)

    listsCount = lCount || 0
  }

  // Fetch followers/following counts
  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
  ])

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-surface p-6 rounded-xl relative border border-amber">
        <div className="flex flex-col items-center md:items-start justify-between gap-4 shrink-0 sm:w-36 self-stretch">
          <div className="flex flex-col items-center md:items-start gap-3 w-full">
            <div className="w-32 h-32 sm:w-36 sm:h-36 relative shrink-0">
              <Avatar 
                url={profile.avatar_url} 
                username={profile.username} 
                displayName={profile.display_name} 
                className="w-full h-full border-2 border-amber/30 text-4xl" 
              />
              {profile.is_private && (
                <div
                  className="absolute -bottom-1 -right-1 p-1.5 bg-surface border border-amber text-amber rounded-full shadow-md"
                  title="Private Account"
                >
                  <Lock size={14} />
                </div>
              )}
            </div>

            {!isOwnProfile && (
              <div className="w-full flex items-center justify-between gap-2">
                {user && (
                  <FollowButton 
                    targetUserId={profile.id} 
                    initialIsFollowing={isAcceptedFollower}
                    initialIsPending={isPendingFollower}
                    className="flex-1 text-xs py-1.5 px-2 text-center truncate"
                  />
                )}
                <ProfileReportButton profileId={profile.id} username={profile.username} />
              </div>
            )}
          </div>

          <div className="mt-auto w-full pt-2">
            <FollowCounts 
              profileId={profile.id}
              username={profile.username}
              followersCount={followersCount || 0}
              followingCount={followingCount || 0}
            />
          </div>
        </div>

        <div className="text-center md:text-left min-w-0 flex-1">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <h1 className="text-2xl font-display font-bold leading-tight">
              {profile.display_name || profile.username}
            </h1>
            {profile.is_private && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber/10 border border-amber/30 text-amber px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock size={10} /> Private
              </span>
            )}
          </div>
          <div className="text-muted text-sm mb-3">@{profile.username}</div>
          {profile.bio && (
            <p className="text-sm text-ink max-w-lg leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          )}
        </div>

        {/* Icon Stat Counters */}
        {canViewContent ? (
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
        ) : (
          <div className="aero-inset flex items-center justify-center p-5 min-w-[180px] text-center text-xs text-muted">
            <Lock size={14} className="mr-1.5 text-amber" /> Content Private
          </div>
        )}
      </div>

      {canViewContent ? (
        <>
          <ProfileTabs username={profile.username} />
          <div>{children}</div>
        </>
      ) : (
        /* Private Profile Shield Placeholder */
        <div className="bg-surface border border-amber rounded-2xl p-10 text-center space-y-4 shadow-xl my-8">
          <div className="w-14 h-14 bg-amber/10 border border-amber/30 rounded-2xl flex items-center justify-center mx-auto text-amber">
            <Lock size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-ink">This Account is Private</h2>
            <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
              Follow @{profile.username} to see their ratings, reviews, custom lists, and watch activity.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
