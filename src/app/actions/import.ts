'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ImportedVideo = {
  id: string
  title: string
  channel: string | null
  url: string
  timestamp: string
}

export async function importWatchHistoryBatch(videos: ImportedVideo[]) {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Deduplicate incoming videos by ID, keeping the most recent watch timestamp
  const uniqueVideosMap = new Map<string, ImportedVideo>()
  for (const v of videos) {
    const existing = uniqueVideosMap.get(v.id)
    if (!existing || new Date(v.timestamp) > new Date(existing.timestamp)) {
      uniqueVideosMap.set(v.id, v)
    }
  }
  const uniqueVideos = Array.from(uniqueVideosMap.values())

  // 2. Prepare videos for upsert
  const videosToUpsert = uniqueVideos.map(v => ({
    id: v.id,
    title: v.title,
    channel: v.channel,
    url: v.url,
    thumbnail_url: `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`,
    created_at: v.timestamp // Use their watch time as the creation time to spread it out
  }))

  // Bulk upsert videos (ignore conflicts, or update title/thumbnail if needed, but onConflict 'id' is standard)
  const { error: videosError } = await supabase
    .from('videos')
    .upsert(videosToUpsert, { onConflict: 'id', ignoreDuplicates: true })

  if (videosError) {
    console.error('Error upserting videos:', videosError)
    return { error: 'Failed to insert videos' }
  }

  // 3. Prepare ratings
  const videoIds = uniqueVideos.map(v => v.id)
  
  // Fetch existing ratings for these videos by this user
  const { data: existingRatings, error: fetchError } = await supabase
    .from('ratings')
    .select('id, video_id, updated_at')
    .eq('user_id', user.id)
    .in('video_id', videoIds)

  if (fetchError) {
    console.error('Error fetching existing ratings:', fetchError)
    return { error: 'Failed to fetch existing ratings' }
  }

  const existingMap = new Map(existingRatings?.map(r => [r.video_id, r]) || [])

  const newRatingsToInsert = []
  const ratingsToUpdate = []

  for (const v of uniqueVideos) {
    const existing = existingMap.get(v.id)
    if (existing) {
      // Only update if the imported timestamp is newer than the existing updated_at
      if (new Date(v.timestamp) > new Date(existing.updated_at)) {
        ratingsToUpdate.push({
          id: existing.id,
          watch_status: 'watched',
          updated_at: v.timestamp
        })
      }
    } else {
      newRatingsToInsert.push({
        user_id: user.id,
        video_id: v.id,
        watch_status: 'watched',
        created_at: v.timestamp,
        updated_at: v.timestamp
      })
    }
  }

  // Insert new ratings
  if (newRatingsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('ratings')
      .upsert(newRatingsToInsert, { onConflict: 'user_id, video_id' })
    if (insertError) {
      console.error('Error inserting ratings:', insertError)
      return { error: 'Failed to insert ratings' }
    }
  }

  // Update existing ratings
  if (ratingsToUpdate.length > 0) {
    await Promise.all(
      ratingsToUpdate.map(async (r) => {
        await supabase
          .from('ratings')
          .update({
            watch_status: 'watched',
            updated_at: r.updated_at
          })
          .eq('id', r.id)
      })
    )
  }

  revalidatePath('/u/[username]', 'layout')
  return { success: true }
}
