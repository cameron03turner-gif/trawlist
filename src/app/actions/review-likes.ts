'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleReviewLike(ratingId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Check if like exists
  const { data: existingLike } = await supabase
    .from('review_likes')
    .select('*')
    .eq('user_id', user.id)
    .eq('rating_id', ratingId)
    .maybeSingle()

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('review_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('rating_id', ratingId)

    if (error) {
      console.error('Error unliking review:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/videos/[id]', 'page')
    return { success: true, liked: false }
  } else {
    // Like
    const { error } = await supabase
      .from('review_likes')
      .insert({ user_id: user.id, rating_id: ratingId })

    if (error) {
      console.error('Error liking review:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/videos/[id]', 'page')
    return { success: true, liked: true }
  }
}
