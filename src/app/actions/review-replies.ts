'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ReviewReply = {
  id: string
  rating_id: string
  user_id: string
  parent_reply_id?: string | null
  content: string
  created_at: string
  updated_at?: string
  like_count?: number
  is_liked?: boolean
  profile?: {
    id: string
    username: string
    display_name?: string
    avatar_url?: string
  }
}

export async function getReviewReplies(ratingId: string): Promise<{ success: boolean; replies?: ReviewReply[]; error?: string }> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: replies, error } = await supabase
      .from('review_replies')
      .select(`
        *,
        profile:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('rating_id', ratingId)
      .order('created_at', { ascending: true })

    if (error) {
      if (error.code === '42P01') {
        return { success: true, replies: [] }
      }
      console.error('Error fetching review replies:', error)
      return { success: false, error: error.message }
    }

    if (!replies || replies.length === 0) {
      return { success: true, replies: [] }
    }

    const replyIds = replies.map(r => r.id)

    // Fetch reply likes count and current user like status
    let likesMap: Record<string, number> = {}
    let userLikedSet = new Set<string>()

    try {
      const { data: allLikes } = await supabase
        .from('review_reply_likes')
        .select('reply_id, user_id')
        .in('reply_id', replyIds)

      if (allLikes) {
        allLikes.forEach(l => {
          likesMap[l.reply_id] = (likesMap[l.reply_id] || 0) + 1
          if (user && l.user_id === user.id) {
            userLikedSet.add(l.reply_id)
          }
        })
      }
    } catch {
      // Ignore if table not created yet
    }

    const enriched = replies.map(r => ({
      ...r,
      like_count: likesMap[r.id] || 0,
      is_liked: userLikedSet.has(r.id),
    }))

    return { success: true, replies: enriched }
  } catch (err: any) {
    return { success: true, replies: [] }
  }
}

export async function addReviewReply({
  ratingId,
  content,
  parentReplyId,
}: {
  ratingId: string
  content: string
  parentReplyId?: string
}): Promise<{ success: boolean; reply?: ReviewReply; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Must be logged in to reply' }
  }

  const trimmed = content.trim()
  if (!trimmed) {
    return { success: false, error: 'Reply content cannot be empty' }
  }

  try {
    const { data: inserted, error } = await supabase
      .from('review_replies')
      .insert({
        rating_id: ratingId,
        user_id: user.id,
        content: trimmed,
        parent_reply_id: parentReplyId || null,
      })
      .select(`
        *,
        profile:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error posting review reply:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/videos/[id]', 'page')
    return {
      success: true,
      reply: {
        ...inserted,
        like_count: 0,
        is_liked: false,
      },
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to post reply' }
  }
}

export async function deleteReviewReply(replyId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { error } = await supabase
      .from('review_replies')
      .delete()
      .eq('id', replyId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting review reply:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/videos/[id]', 'page')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete reply' }
  }
}
