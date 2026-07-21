import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { searchParams } = new URL(req.url)
  const feedType = searchParams.get('type') || 'community' // 'following' or 'community'

  let targetUserIds: string[] | null = null

  if (feedType === 'following') {
    if (!user) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
    }
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    if (!follows || follows.length === 0) {
      return NextResponse.json({ items: [] })
    }
    targetUserIds = follows.map((f) => f.following_id)
  }

  // Fetch recent ratings
  let ratingsQuery = supabase
    .from('ratings')
    .select(`
      id,
      rating,
      review,
      watch_status,
      updated_at,
      user_id,
      video:videos(*),
      user:profiles!ratings_user_id_fkey(username, display_name, avatar_url)
    `)
    .order('updated_at', { ascending: false })
    .limit(30)

  if (targetUserIds) {
    ratingsQuery = ratingsQuery.in('user_id', targetUserIds)
  }

  // Fetch recent list creations
  let listsQuery = supabase
    .from('lists')
    .select(`
      id,
      title,
      description,
      is_ranked,
      created_at,
      owner_id,
      owner:profiles!lists_owner_id_fkey(username, display_name, avatar_url),
      items:list_items(
        position,
        video:videos(thumbnail_url)
      ),
      items_count:list_items(count)
    `)
    .eq('is_private', false)
    .order('created_at', { ascending: false })
    .limit(10)
    .limit(4, { foreignTable: 'list_items' })
    .order('position', { foreignTable: 'list_items', ascending: true })

  if (targetUserIds) {
    listsQuery = listsQuery.in('owner_id', targetUserIds)
  }

  const [ratingsRes, listsRes] = await Promise.all([ratingsQuery, listsQuery])

  if (ratingsRes.error) {
    return NextResponse.json({ error: ratingsRes.error.message }, { status: 500 })
  }
  if (listsRes.error) {
    return NextResponse.json({ error: listsRes.error.message }, { status: 500 })
  }

  // Normalize into a single feed
  const items = [
    ...(ratingsRes.data || []).map((r) => ({
      type: 'rating',
      id: `rating-${r.id}`,
      timestamp: r.updated_at,
      user: r.user,
      data: r,
    })),
    ...(listsRes.data || []).map((l) => ({
      type: 'list_created',
      id: `list-${l.id}`,
      timestamp: l.created_at,
      user: l.owner,
      data: l,
    })),
  ]

  // Sort chronologically
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return NextResponse.json({ items })
}
