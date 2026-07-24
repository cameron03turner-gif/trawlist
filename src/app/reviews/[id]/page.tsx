import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, ExternalLink, Play } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Metadata } from 'next'
import { Avatar } from '@/components/Avatar'
import { Scrubber } from '@/components/Scrubber'
import { ReviewClientActions } from '@/components/ReviewClientActions'
import { ReviewRepliesSection } from '@/components/ReviewRepliesSection'

export const revalidate = 0

type Props = {
  params: Promise<{ id: string }>
}

async function fetchRating(id: string) {
  const supabase = await createClient()
  
  const { data: rating } = await supabase
    .from('ratings')
    .select(`
      *,
      profile:profiles!ratings_user_id_fkey(id, username, display_name, avatar_url),
      video:videos(id, title, channel, channel_id, thumbnail_url, url)
    `)
    .eq('id', id)
    .maybeSingle()

  if (rating) return rating

  // Fallback relationship query
  const { data: fallbackRating } = await supabase
    .from('ratings')
    .select(`
      *,
      profiles(id, username, display_name, avatar_url),
      videos(id, title, channel, channel_id, thumbnail_url, url)
    `)
    .eq('id', id)
    .maybeSingle()

  if (!fallbackRating) return null

  return {
    ...fallbackRating,
    profile: Array.isArray(fallbackRating.profiles) ? fallbackRating.profiles[0] : fallbackRating.profiles,
    video: Array.isArray(fallbackRating.videos) ? fallbackRating.videos[0] : fallbackRating.videos,
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const rating = await fetchRating(params.id)

  if (!rating) {
    return { title: 'Review Not Found | Trawlist' }
  }

  const profile = rating.profile
  const video = rating.video

  const authorName = profile?.display_name || (profile?.username ? `@${profile.username}` : 'User')
  const videoTitle = video?.title || 'YouTube Video'
  const title = `Review of "${videoTitle}" by ${authorName} | Trawlist`

  const reviewExcerpt = rating.review
    ? `"${rating.review.slice(0, 160)}${rating.review.length > 160 ? '...' : ''}"`
    : `${authorName}'s ${rating.rating ? `${rating.rating}★ ` : ''}review of ${videoTitle} on Trawlist.`

  const description = `${authorName} rated ${videoTitle} ${rating.rating ? `${rating.rating}★` : ''}. ${reviewExcerpt}`
  const imageUrl = video?.thumbnail_url || profile?.avatar_url || 'https://www.trawlist.com/og-banner.jpg'

  return {
    title,
    description,
    openGraph: {
      title: `Review of "${videoTitle}" by ${authorName}`,
      description,
      url: `https://www.trawlist.com/reviews/${params.id}`,
      siteName: 'Trawlist',
      images: [
        {
          url: imageUrl,
          width: 1280,
          height: 720,
          alt: `Review of ${videoTitle} by ${authorName}`,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Review of "${videoTitle}" by ${authorName}`,
      description,
      images: [imageUrl],
    },
  }
}

export default async function FullReviewPage(props: Props) {
  const params = await props.params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const ratingData = await fetchRating(params.id)

  if (!ratingData) {
    notFound()
  }

  const profile = ratingData.profile
  const video = ratingData.video

  // Fetch likes count and current user like status
  const { count: likeCount } = await supabase
    .from('review_likes')
    .select('*', { count: 'exact', head: true })
    .eq('review_id', ratingData.id)

  let isLiked = false
  if (user) {
    const { data: userLike } = await supabase
      .from('review_likes')
      .select('user_id')
      .eq('review_id', ratingData.id)
      .eq('user_id', user.id)
      .maybeSingle()
    isLiked = !!userLike
  }

  const isEdited = ratingData.created_at && ratingData.updated_at && Math.abs(new Date(ratingData.updated_at).getTime() - new Date(ratingData.created_at).getTime()) > 60000

  const timeAgo = ratingData.updated_at ? (() => {
    try {
      const d = new Date(ratingData.updated_at)
      if (isNaN(d.getTime())) return ''
      const dist = formatDistanceToNow(d, { addSuffix: true })
      return isEdited ? `edited ${dist}` : dist
    } catch {
      return ''
    }
  })() : ''

  const numRating = ratingData.rating != null && !isNaN(Number(ratingData.rating)) ? Number(ratingData.rating) : null

  return (
    <div className="w-full pb-16 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <a
          href={`/videos/${video?.id || ratingData.video_id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-amber transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Video Page</span>
        </a>
      </div>

      {/* Target Video Context Card (Above Review) */}
      {video && (
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-muted font-bold">Reviewed Video</h3>
          <div className="bg-surface border border-amber rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
            <a href={`/videos/${video.id}`} className="shrink-0 relative group">
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-48 sm:w-56 aspect-video object-cover rounded-lg border border-amber/30 group-hover:border-amber transition shadow-md"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg">
                <Play size={28} className="text-amber fill-amber" />
              </div>
            </a>
            <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
              <a href={`/videos/${video.id}`} className="font-bold text-ink hover:text-amber text-lg sm:text-xl line-clamp-2 transition leading-snug">
                {video.title}
              </a>
              {video.channel && (
                <p className="text-sm text-muted font-medium">
                  {video.channel}
                </p>
              )}
              <div className="pt-2">
                <a
                  href={`/videos/${video.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber hover:underline"
                >
                  <span>View Video Page & All Reviews</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Review Card Panel */}
      <div className="bg-surface border border-amber rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl hover:shadow-xl hover:shadow-amber/10 hover:brightness-110 hover:scale-[1.01] relative overflow-hidden transition-all duration-300">
        {/* Author Header & Top Action Controls */}
        <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3.5">
            <Link href={`/u/${profile?.username || 'user'}`}>
              <Avatar
                url={profile?.avatar_url}
                username={profile?.username || 'user'}
                displayName={profile?.display_name}
                className="w-12 h-12 text-ink hover:ring-2 hover:ring-amber transition-all shrink-0"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/u/${profile?.username || 'user'}`} className="text-lg font-bold text-ink hover:text-amber transition-colors">
                  {profile?.display_name || profile?.username || 'User'}
                </Link>
                <Link href={`/u/${profile?.username || 'user'}`} className="text-xs text-muted hover:underline">
                  @{profile?.username || 'user'}
                </Link>
                {user && ratingData.user_id === user.id && (
                  <span className="text-[10px] font-bold text-amber uppercase tracking-wider bg-amber/10 border border-amber/30 px-2 py-0.5 rounded">
                    Your Review
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {numRating !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-amber font-bold font-mono">
                      {numRating.toFixed(1)} ★
                    </span>
                    <Scrubber value={numRating} interactive={false} height={16} />
                  </div>
                )}
                {timeAgo && (
                  <span className="text-sm text-muted" suppressHydrationWarning>
                    {numRating !== null ? '• ' : ''}{timeAgo}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
            <ReviewClientActions
              reviewId={ratingData.id}
              initialLikeCount={likeCount || 0}
              initialIsLiked={isLiked}
              currentUserId={user?.id}
              isMine={!!(user && ratingData.user_id === user.id)}
              authorUsername={profile?.username || 'user'}
            />
          </div>
        </div>

        {/* Review Body Text */}
        {ratingData.review ? (
          <div className="text-base sm:text-lg text-ink leading-relaxed whitespace-pre-wrap font-sans pt-1">
            {ratingData.review}
          </div>
        ) : (
          <div className="text-sm text-muted italic">
            This rating was logged without a written review.
          </div>
        )}

        {/* Embedded Reply Chain */}
        <div className="border-t border-amber/20 pt-4 mt-2">
          <ReviewRepliesSection
            ratingId={ratingData.id}
            currentUserId={user?.id}
          />
        </div>
      </div>
    </div>
  )
}
