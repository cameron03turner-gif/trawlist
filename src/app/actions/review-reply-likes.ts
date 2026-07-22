'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleReplyLike(replyId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { data: existingLike } = await supabase
      .from('review_reply_likes')
      .select('*')
      .eq('user_id', user.id)
      .eq('reply_id', replyId)
      .maybeSingle()

    if (existingLike) {
      const { error } = await supabase
        .from('review_reply_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('reply_id', replyId)

      if (error) {
        console.error('Error unliking reply:', error)
        return { success: false, error: error.message }
      }

      revalidatePath('/videos/[id]', 'page')
      return { success: true, liked: false }
    } else {
      const { error } = await supabase
        .from('review_reply_likes')
        .insert({ user_id: user.id, reply_id: replyId })

      if (error) {
        console.error('Error liking reply:', error)
        return { success: false, error: error.message }
      }

      revalidatePath('/videos/[id]', 'page')
      return { success: true, liked: true }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to toggle like' }
  }
}
