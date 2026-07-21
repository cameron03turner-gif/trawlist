'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleListLike(listId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'unauthorized' }
  }

  // Check if like exists
  const { data: existingLike } = await supabase
    .from('list_likes')
    .select('*')
    .eq('user_id', user.id)
    .eq('list_id', listId)
    .single()

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('list_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('list_id', listId)

    if (error) {
      console.error('Error unliking list:', error)
      return { success: false, error: error.message }
    }
  } else {
    // Like
    const { error } = await supabase
      .from('list_likes')
      .insert({ user_id: user.id, list_id: listId })

    if (error) {
      console.error('Error liking list:', error)
      return { success: false, error: error.message }
    }
  }

  // Revalidate routes that might show lists
  revalidatePath('/lists')
  revalidatePath('/u/[username]/lists', 'page')

  return { success: true }
}
