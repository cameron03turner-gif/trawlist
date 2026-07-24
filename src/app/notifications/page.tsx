import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bell, UserPlus, UserCheck, Heart, Inbox } from 'lucide-react'
import { MarkAllReadButton } from '@/components/MarkAllReadButton'
import { FollowRequestItem } from '@/components/FollowRequestItem'
import { formatDistanceToNow } from 'date-fns'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notifications | Trawlist',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, actor:profiles!actor_id(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch lists for 'list_liked' notifications
  const listIds = notifications?.filter(n => n.type === 'list_liked' && n.entity_id).map(n => n.entity_id) || []
  let listsMap: Record<string, any> = {}
  if (listIds.length > 0) {
    const { data: lists } = await supabase.from('lists').select('id, name, slug').in('id', listIds)
    if (lists) {
      lists.forEach(l => listsMap[l.id] = l)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display tracking-tight text-ink flex items-center gap-2">
          <Bell className="text-amber" size={24} /> Notifications
        </h1>
        <MarkAllReadButton />
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="text-center py-16 px-4 border border-amber rounded-xl bg-surface">
          <Inbox size={32} className="mx-auto text-muted mb-4 opacity-50" />
          <h2 className="text-lg font-bold text-ink mb-1">All caught up!</h2>
          <p className="text-muted text-sm max-w-sm mx-auto">
            You don't have any notifications yet. When someone follows you or likes your lists, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const actor = Array.isArray(n.actor) ? n.actor[0] : n.actor
            const isUnread = !n.is_read
            
            let icon = <Bell size={18} className="text-muted" />
            let content = <span>Unknown notification</span>
            let linkUrl = '#'
            const isFollowRequest = n.type === 'follow_request'

            if (n.type === 'follow_request' && actor) {
              icon = <UserPlus size={18} className="text-amber" />
              linkUrl = `/u/${actor.username}`
              content = <FollowRequestItem notificationId={n.id} actor={actor} />
            } else if (n.type === 'follow_request_accepted' && actor) {
              icon = <UserCheck size={18} className="text-emerald-400" />
              linkUrl = `/u/${actor.username}`
              content = (
                <span>
                  <span className="font-semibold text-ink">{actor.display_name || actor.username}</span> accepted your follow request.
                </span>
              )
            } else if (n.type === 'new_follower' && actor) {
              icon = <UserPlus size={18} className="text-blue-400" />
              linkUrl = `/u/${actor.username}`
              content = (
                <span>
                  <span className="font-semibold text-ink">{actor.display_name || actor.username}</span> started following you.
                </span>
              )
            } else if (n.type === 'list_liked' && actor && n.entity_id) {
              icon = <Heart size={18} className="text-rec fill-rec/20" />
              const list = listsMap[n.entity_id]
              linkUrl = list ? `/lists/${list.id}/${list.slug}` : `/u/${actor.username}`
              content = (
                <span>
                  <span className="font-semibold text-ink">{actor.display_name || actor.username}</span> liked your list <span className="font-semibold text-ink">{list ? list.name : 'Unknown List'}</span>.
                </span>
              )
            }

            return (
              <Link 
                key={n.id} 
                href={linkUrl}
                className={`block p-4 rounded-xl border transition group ${
                  isUnread ? 'bg-surface border-amber/50 hover:bg-surface-alt' : 'bg-bg border-amber/30 hover:border-amber/30'
                }`}
              >
                <div className="flex gap-4">
                  <div className="pt-1">{icon}</div>
                  <div className="flex-1">
                    <div className="text-sm text-muted">
                      {content}
                    </div>
                    <p className="text-xs text-muted/70 mt-1 uppercase tracking-wider font-semibold" suppressHydrationWarning>
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {isUnread && (
                    <div className="w-2 h-2 rounded-full bg-amber mt-2 shrink-0"></div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
