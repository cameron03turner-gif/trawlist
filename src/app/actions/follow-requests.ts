'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function acceptFollowRequest(followerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not logged in.' }
  }

  // 1. Update status to 'accepted'
  const { error: followError } = await supabase
    .from('follows')
    .update({ status: 'accepted' })
    .eq('follower_id', followerId)
    .eq('following_id', user.id)

  if (followError) {
    console.error('Error accepting follow request:', followError)
    return { error: followError.message || 'Failed to accept follow request.' }
  }

  // 2. Mark notification read or delete follow_request notification
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('actor_id', followerId)
    .eq('type', 'follow_request')

  // 3. Notify requester that request was accepted
  await supabase
    .from('notifications')
    .insert({
      user_id: followerId,
      type: 'follow_request_accepted',
      actor_id: user.id,
      entity_id: null,
    })

  revalidatePath('/notifications')
  revalidatePath('/u/[username]', 'layout')
  return { ok: true }
}

export async function declineFollowRequest(followerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not logged in.' }
  }

  // 1. Delete follow record
  const { error: followError } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', user.id)

  if (followError) {
    console.error('Error declining follow request:', followError)
    return { error: followError.message || 'Failed to decline follow request.' }
  }

  // 2. Delete notification
  await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id)
    .eq('actor_id', followerId)
    .eq('type', 'follow_request')

  revalidatePath('/notifications')
  revalidatePath('/u/[username]', 'layout')
  return { ok: true }
}

export async function toggleAccountPrivacy(isPrivate: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not logged in.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ is_private: isPrivate })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating privacy setting:', error)
    return { error: error.message || 'Failed to update privacy setting.' }
  }

  // If turning privacy OFF, auto-accept any pending follow requests
  if (!isPrivate) {
    await supabase
      .from('follows')
      .update({ status: 'accepted' })
      .eq('following_id', user.id)
      .eq('status', 'pending')
  }

  revalidatePath('/settings')
  revalidatePath('/u/[username]', 'layout')
  return { ok: true }
}
