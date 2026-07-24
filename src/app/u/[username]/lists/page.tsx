import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ListCard } from '@/components/ListCard'
import { CreateListButton } from '@/components/CreateListButton'
import { ListVideo } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function UserListsPage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params
  
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, username')
    .eq('username', params.username.toLowerCase())
    .single()

  if (!profile) {
    notFound()
  }

  const { data: { session } } = await supabase.auth.getSession()
  const isOwnProfile = session?.user?.id === profile.id

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
      likes_count:list_likes(count)
    `)
    .eq('owner_id', profile.id)
    .order('updated_at', { ascending: false })
    .limit(4, { foreignTable: 'list_items' })
    .order('position', { foreignTable: 'list_items', ascending: true })

  if (!isOwnProfile) {
    query = query.eq('is_private', false)
  }

  const { data: lists } = await query

  const likedListIds = new Set<string>()
  if (session?.user) {
    const { data: userLikes } = await supabase
      .from('list_likes')
      .select('list_id')
      .eq('user_id', session.user.id)
    if (userLikes) {
      userLikes.forEach(l => likedListIds.add(l.list_id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-ink">
          {isOwnProfile ? 'Your Lists' : `${profile.display_name || profile.username}'s Lists`}
        </h2>
        {isOwnProfile && (
          <div>
            <CreateListButton />
          </div>
        )}
      </div>

      {(!lists || lists.length === 0) ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-amber">
          <ListVideo className="mx-auto text-muted mb-4" size={32} />
          <h3 className="text-lg font-medium text-ink mb-2">No lists yet</h3>
          <p className="text-muted">
            {isOwnProfile 
              ? "You haven't created any lists yet."
              : "This user hasn't created any public lists."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map(list => (
            <ListCard key={list.id} list={list as any} initialIsLiked={likedListIds.has(list.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
