'use server'

import { createClient } from '@/lib/supabase/server'
import { extractVideoId, fetchOEmbed, fetchChannelThumbnail } from '@/lib/youtube'
import { revalidatePath } from 'next/cache'

export async function toggleWatchlist(videoUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const videoId = extractVideoId(videoUrl)
  if (!videoId) return { error: 'Invalid URL' }

  const { data: existingVideo } = await supabase.from('videos').select('id').eq('id', videoId).maybeSingle()

  if (!existingVideo) {
    const meta = await fetchOEmbed(videoId)
    if (!meta) {
      return { error: 'Could not find that video' }
    }

    let channelId = meta.author_name
    let channelThumbnail = null
    if (meta.author_url?.includes('@')) {
      channelId = '@' + meta.author_url.split('@')[1].split('/')[0]
      channelThumbnail = await fetchChannelThumbnail(meta.author_url)
    }

    await supabase.from('channels').upsert({
      id: channelId,
      name: meta.author_name,
      ...(channelThumbnail ? { thumbnail_url: channelThumbnail } : {})
    }, { onConflict: 'id' })

    const { error: videoError } = await supabase.from('videos').upsert({
      id: videoId,
      title: meta.title,
      channel: meta.author_name,
      channel_id: channelId,
      thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    })
    if (videoError) {
      return { error: videoError.message }
    }
  }

  const { data: currentRating } = await supabase
    .from('ratings')
    .select('*')
    .eq('video_id', videoId)
    .eq('user_id', user.id)
    .maybeSingle()

  const newStatus = currentRating?.watch_status === 'want_to_watch' ? null : 'want_to_watch'

  if (currentRating) {
    if (newStatus === null && !currentRating.rating && !currentRating.review && !currentRating.note && !currentRating.liked) {
      await supabase.from('ratings').delete().eq('id', currentRating.id)
    } else {
      await supabase.from('ratings').update({ watch_status: newStatus, updated_at: new Date().toISOString() }).eq('id', currentRating.id)
    }
  } else if (newStatus !== null) {
    await supabase.from('ratings').insert({
      user_id: user.id,
      video_id: videoId,
      watch_status: newStatus,
      liked: false
    })
  }

  revalidatePath('/', 'layout')
  return { ok: true, isOnWatchlist: newStatus === 'want_to_watch' }
}

export async function removeLog(videoUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const videoId = extractVideoId(videoUrl)
  if (!videoId) return { error: 'Invalid URL' }

  const { data: currentRating } = await supabase
    .from('ratings')
    .select('*')
    .eq('video_id', videoId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (currentRating) {
    if (!currentRating.liked && currentRating.watch_status !== 'want_to_watch') {
      const { error } = await supabase.from('ratings').delete().eq('id', currentRating.id)
      if (error) return { error: error.message }
    } else {
      // If they liked it or it's on their watchlist, we must keep the row but clear the log data
      const { error } = await supabase.from('ratings').update({ 
        rating: null, 
        review: null, 
        note: null, 
        watch_status: currentRating.watch_status === 'want_to_watch' ? 'want_to_watch' : null 
      }).eq('id', currentRating.id)
      
      if (error) return { error: error.message }
    }
  }

  revalidatePath('/videos/[id]', 'page')
  return { ok: true }
}
