import { ListVideo, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ListCard } from '@/components/ListCard'
import { CreateListButton } from '@/components/CreateListButton'
import { ListControls } from '@/components/ListControls'
import Link from 'next/link'

import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Curated Video Playlists & Lists | Trawlist',
  description: 'Browse themed video playlists, essays collections, and watchlists curated by the Trawlist community.',
  openGraph: {
    title: 'Curated Video Playlists & Lists | Trawlist',
    description: 'Browse themed video playlists, essays collections, and watchlists curated by the Trawlist community.',
    url: 'https://www.trawlist.com/lists',
    siteName: 'Trawlist',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: 'Curated Lists on Trawlist' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Curated Video Playlists & Lists | Trawlist',
    description: 'Browse themed video playlists, essays collections, and watchlists curated by the Trawlist community.',
    images: ['/og-banner.jpg'],
  },
}

export default async function ListsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'recent'
  const network = typeof searchParams.network === 'string' ? searchParams.network : 'community'
  const q = typeof searchParams.q === 'string' ? searchParams.q : ''

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('lists')
    .select(`
      *, 
      owner:profiles!lists_owner_id_fkey(username, display_name, avatar_url),
      items:list_items(
        position,
        video:videos(thumbnail_url)
      ),
      items_count:list_items(count),
      likes_count
    `)
    .eq('is_private', false)
    .limit(30)
    .limit(4, { foreignTable: 'list_items' })
    .order('position', { foreignTable: 'list_items', ascending: true })

  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  if (network === 'following' && user) {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
    
    const followingIds = (follows || []).map(f => f.following_id)
    if (followingIds.length > 0) {
      query = query.in('owner_id', followingIds)
    } else {
      query = query.in('owner_id', ['00000000-0000-0000-0000-000000000000'])
    }
  }

  if (sort === 'popular') {
    query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: lists } = await query

  // Fetch which lists the current user has liked
  const likedListIds = new Set<string>()
  if (user) {
    const { data: userLikes } = await supabase
      .from('list_likes')
      .select('list_id')
      .eq('user_id', user.id)
    if (userLikes) {
      userLikes.forEach(l => likedListIds.add(l.list_id))
    }
  }

  return (
    <div className="pb-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2">Community Lists</h1>
          <p className="text-muted">Discover themed collections of videos created by the community.</p>
        </div>
        {user ? (
          <div>
            <CreateListButton />
          </div>
        ) : (
          <Link href="/login" className="inline-flex items-center gap-2 px-4 py-2 bg-amber text-bg rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-sm">
            <LogIn size={15} /> Sign in to Create List
          </Link>
        )}
      </div>

      <ListControls />

      <div className="max-w-6xl mx-auto">
        {(!lists || lists.length === 0) ? (
          <div className="text-center py-16 px-4 bg-surface rounded-xl border border-amber shadow-sm">
            <ListVideo className="mx-auto text-muted mb-3" size={32} />
            <h3 className="text-lg font-bold text-ink mb-1">No lists yet</h3>
            <p className="text-muted text-sm">Be the first to create a list!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map(list => (
              <ListCard key={list.id} list={list as any} initialIsLiked={likedListIds.has(list.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
