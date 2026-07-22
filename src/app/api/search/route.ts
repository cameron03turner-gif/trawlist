import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || ''
  const type = searchParams.get('type') || 'all'

  if (!q) {
    return NextResponse.json({
      users: [],
      videos: [],
      lists: [],
      channels: [],
      followingIds: [],
    })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get following IDs if user is signed in
  let followingIds: string[] = []
  if (user) {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
    if (follows) {
      followingIds = follows.map((f) => f.following_id)
    }
  }

  const searchUsers = type === 'all' || type === 'users'
  const searchVideos = type === 'all' || type === 'videos'
  const searchLists = type === 'all' || type === 'lists'
  const searchChannels = type === 'all' || type === 'channels'

  const promises: Promise<any>[] = []

  // 1. Users Search
  if (searchUsers) {
    promises.push(
      Promise.resolve(
        supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, bio')
          .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
          .limit(8)
      )
    )
  } else {
    promises.push(Promise.resolve({ data: [] }))
  }

  // 2. Videos Search
  if (searchVideos) {
    promises.push(
      Promise.resolve(
        supabase
          .from('video_leaderboard')
          .select('*')
          .or(`title.ilike.%${q}%,channel.ilike.%${q}%`)
          .limit(8)
      )
    )
  } else {
    promises.push(Promise.resolve({ data: [] }))
  }

  // 3. Lists Search
  if (searchLists) {
    promises.push(
      Promise.resolve(
        supabase
          .from('lists')
          .select(`
            id,
            title,
            description,
            created_at,
            owner:profiles!lists_owner_id_fkey(username, display_name, avatar_url),
            items_count:list_items(count)
          `)
          .eq('is_private', false)
          .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
          .limit(8)
      )
    )
  } else {
    promises.push(Promise.resolve({ data: [] }))
  }

  // 4. Channels Search
  if (searchChannels) {
    promises.push(
      Promise.resolve(
        supabase
          .from('channel_leaderboard')
          .select('*')
          .ilike('name', `%${q}%`)
          .limit(8)
      )
    )
  } else {
    promises.push(Promise.resolve({ data: [] }))
  }

  const [usersRes, videosRes, listsRes, channelsRes] = await Promise.all(promises)

  return NextResponse.json({
    users: usersRes?.data || [],
    videos: videosRes?.data || [],
    lists: listsRes?.data || [],
    channels: channelsRes?.data || [],
    followingIds,
  })
}
