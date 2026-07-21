import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ListClientContent } from '@/components/ListClientContent'

export const dynamic = 'force-dynamic'

export default async function ListDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch list details and items
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('*, owner:profiles!lists_owner_id_fkey(username, display_name, avatar_url), list_likes(user_id)')
    .eq('id', params.id)
    .single()

  if (listError || !list) {
    notFound()
  }

  if (list.is_private && list.owner_id !== user?.id) {
    notFound()
  }

  const { data: items } = await supabase
    .from('list_items')
    .select('position, note, video:videos(*, channels(thumbnail_url), ratings(rating))')
    .eq('list_id', params.id)
    .order('position', { ascending: true })

  const formattedItems = (items || []).map(item => {
    const validRatings = (item.video as any)?.ratings?.filter((r: any) => r.rating !== null) || []
    const avg_rating = validRatings.length > 0 
      ? validRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / validRatings.length 
      : null

    return {
      ...item,
      video: {
        ...item.video,
        channel_thumbnail_url: (item.video as any)?.channels?.thumbnail_url,
        avg_rating
      }
    }
  })

  const isOwner = user?.id === list.owner_id
  const initialLikesCount = list.list_likes?.length || 0
  const initialIsLiked = user ? list.list_likes?.some((l: any) => l.user_id === user.id) : false

  return (
    <div className="pt-12 px-4 max-w-4xl mx-auto">
      <ListClientContent 
        list={list} 
        initialItems={formattedItems} 
        isOwner={isOwner}
        initialIsLiked={initialIsLiked}
        initialLikesCount={initialLikesCount}
      />
    </div>
  )
}
