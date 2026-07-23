import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ListClientContent } from '@/components/ListClientContent'

import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const supabase = await createClient()

  const { data: list } = await supabase
    .from('lists')
    .select('title, description, is_private, owner:profiles!lists_owner_id_fkey(username, display_name)')
    .eq('id', params.id)
    .single()

  if (!list || list.is_private) return { title: 'List | Trawlist' }

  const ownerName = (list.owner as any)?.display_name || (list.owner as any)?.username || 'User'
  const title = `${list.title} by ${ownerName} | Trawlist`
  const description = list.description || `A custom curated video playlist by ${ownerName} on Trawlist.`

  // Fetch first video thumbnail for list card preview image if available
  const { data: firstItem } = await supabase
    .from('list_items')
    .select('video:videos(thumbnail_url)')
    .eq('list_id', params.id)
    .order('position', { ascending: true })
    .limit(1)
    .maybeSingle()

  const imageUrl = (firstItem?.video as any)?.thumbnail_url || '/og-banner.jpg'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.trawlist.com/lists/${params.id}`,
      siteName: 'Trawlist',
      images: [
        {
          url: imageUrl,
          width: 1280,
          height: 720,
          alt: list.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function ListDetailPage(props: Props) {
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
