import { createClient } from '@/lib/supabase/server'
import { LeaderboardControls } from '@/components/LeaderboardControls'
import { LeaderboardList } from '@/components/LeaderboardList'
import { SearchX, Trophy } from 'lucide-react'
import { Metadata } from 'next'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Videos | Scrubbed',
}

export default async function LeaderboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'avg'
  const minCount = typeof searchParams.min === 'string' ? parseInt(searchParams.min) : 1
  const network = typeof searchParams.network === 'string' ? searchParams.network : 'community'

  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData.session

  let data: any[] = []

  if (network === 'following' && session) {
    const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', session.user.id)
    const followingIds = follows?.map(f => f.following_id) || []

    if (followingIds.length > 0) {
      let rQuery = supabase
        .from('ratings')
        .select('rating, updated_at, video_id, videos(*, channels(thumbnail_url))')
        .in('user_id', followingIds)
        .not('rating', 'is', null)

      const { data: rawRatings } = await rQuery

      if (rawRatings) {
        const aggs: Record<string, any> = {}
        rawRatings.forEach(r => {
          if (!aggs[r.video_id]) {
            const v: any = r.videos
            aggs[r.video_id] = {
              id: r.video_id,
              title: v.title,
              channel: v.channel,
              channel_thumbnail_url: v.channels?.thumbnail_url,
              thumbnail_url: v.thumbnail_url,
              url: v.url,
              sum: 0,
              rating_count: 0,
              last_rated_at: r.updated_at
            }
          }
          const rating = Number(r.rating)
          aggs[r.video_id].sum += rating
          aggs[r.video_id].rating_count += 1
          if (new Date(r.updated_at) > new Date(aggs[r.video_id].last_rated_at)) {
            aggs[r.video_id].last_rated_at = r.updated_at
          }
        })

        data = Object.values(aggs).map(a => ({
          ...a,
          avg_rating: (a.sum / a.rating_count).toFixed(2)
        })).filter(a => a.rating_count >= minCount)

        if (q) {
          const lowerQ = q.toLowerCase()
          data = data.filter(a => a.title.toLowerCase().includes(lowerQ) || a.channel?.toLowerCase().includes(lowerQ))
        }

        if (sort === 'count') {
          data.sort((a, b) => b.rating_count - a.rating_count || b.avg_rating - a.avg_rating)
        } else if (sort === 'recent') {
          data.sort((a, b) => new Date(b.last_rated_at).getTime() - new Date(a.last_rated_at).getTime() || b.avg_rating - a.avg_rating)
        } else {
          data.sort((a, b) => b.avg_rating - a.avg_rating || b.rating_count - a.rating_count)
        }
        
        data = data.slice(0, 50)
      }
    }
  } else {
    let query = supabase
      .from('video_leaderboard')
      .select('*')
      .gte('rating_count', minCount)
      .limit(50)



    if (sort === 'count') {
      query = query.order('rating_count', { ascending: false }).order('avg_rating', { ascending: false })
    } else if (sort === 'recent') {
      query = query.order('last_rated_at', { ascending: false }).order('avg_rating', { ascending: false })
    } else {
      query = query.order('avg_rating', { ascending: false }).order('rating_count', { ascending: false })
    }

    if (q) {
      query = query.or(`title.ilike.%${q}%,channel.ilike.%${q}%`)
    }

    const res = await query
    data = res.data || []
  }
  
  let userLikes: string[] = []
  let userLogged: string[] = []
  
  if (data && data.length > 0) {
    const videoIds = data.map((v: any) => v.id)
    
    // Fetch review counts
    const { data: reviewsCountData } = await supabase
      .from('ratings')
      .select('video_id')
      .in('video_id', videoIds)
      .not('review', 'is', null)
      .neq('review', '')
      
    const reviewCounts: Record<string, number> = {}
    if (reviewsCountData) {
      reviewsCountData.forEach(r => {
        reviewCounts[r.video_id] = (reviewCounts[r.video_id] || 0) + 1
      })
    }

    // Fetch likes counts
    const { data: likesCountData } = await supabase
      .from('ratings')
      .select('video_id')
      .in('video_id', videoIds)
      .eq('liked', true)
      
    const likesCounts: Record<string, number> = {}
    if (likesCountData) {
      likesCountData.forEach(r => {
        likesCounts[r.video_id] = (likesCounts[r.video_id] || 0) + 1
      })
    }
    
    data = data.map(v => ({
      ...v,
      review_count: reviewCounts[v.id] || 0,
      likes_count: likesCounts[v.id] || 0
    }))

    // Fetch user likes
    if (session) {
      const { data: userRatings } = await supabase
        .from('ratings')
        .select('video_id, liked')
        .eq('user_id', session.user.id)
        .in('video_id', videoIds)
        
      if (userRatings) {
        userLikes = userRatings.filter(r => r.liked).map(r => r.video_id)
        userLogged = userRatings.map(r => r.video_id)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2">Videos</h1>
        <p className="text-muted">Explore the community's highest-rated and most popular videos.</p>
      </div>

      <LeaderboardControls />

      {!data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-surface rounded-xl">
          {q ? (
            <>
              <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center text-muted">
                <SearchX size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No results found for &quot;{q}&quot;</p>
                <p className="text-sm text-muted">Try a different search term.</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center text-muted">
                <Trophy size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No community ratings yet.</p>
                <p className="text-sm text-muted">Be the first to rate something on the Rate tab.</p>
              </div>
            </>
          )}
        </div>
      ) : (
        <LeaderboardList data={data} userLikes={userLikes} userLogged={userLogged} />
      )}
    </div>
  )
}
