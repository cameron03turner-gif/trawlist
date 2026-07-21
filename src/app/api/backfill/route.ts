import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchChannelThumbnail } from '@/lib/youtube'

// YouTube OEmbed response
type OEmbedResponse = {
  author_name: string
  author_url: string
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only allowed in development' }, { status: 403 })
  }

  const supabase = await createClient()

  // Ensure user is authenticated to bypass RLS restrictions (we use the user's token)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Must be logged in to run backfill' }, { status: 401 })
  }

  // 1. Fetch all videos where channel_id is null
  const { data: videos, error: videosError } = await supabase
    .from('videos')
    .select('id, url, channel')
    .is('channel_id', null)

  // Fetch all channels where thumbnail_url is null
  const { data: channels, error: channelsError } = await supabase
    .from('channels')
    .select('id, name')
    .is('thumbnail_url', null)

  if (videosError || channelsError) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if ((!videos || videos.length === 0) && (!channels || channels.length === 0)) {
    return NextResponse.json({ message: 'No videos or channels need backfilling' })
  }

  const results = {
    total: videos.length,
    success: 0,
    failed: 0,
    errors: [] as any[]
  }

  // 2. Iterate and update
  for (const video of videos) {
    try {
      // Call YouTube OEmbed
      const ytUrl = encodeURIComponent(video.url)
      const res = await fetch(`https://www.youtube.com/oembed?url=${ytUrl}&format=json`)
      if (!res.ok) {
        throw new Error(`OEmbed failed with status ${res.status}`)
      }

      const oembed: OEmbedResponse = await res.json()
      
      // Extract channel handle from author_url (e.g. "https://www.youtube.com/@mkbhd")
      let channelId = oembed.author_name // Fallback to name if we can't parse the URL
      let channelThumbnail = null
      if (oembed.author_url.includes('@')) {
        channelId = '@' + oembed.author_url.split('@')[1].split('/')[0]
        channelThumbnail = await fetchChannelThumbnail(oembed.author_url)
      }

      // 3. Upsert channel
      const { error: channelError } = await supabase
        .from('channels')
        .upsert({
          id: channelId,
          name: oembed.author_name,
          ...(channelThumbnail ? { thumbnail_url: channelThumbnail } : {})
        }, { onConflict: 'id' })

      if (channelError) throw channelError

      // 4. Update video
      const { error: updateError } = await supabase
        .from('videos')
        .update({ channel_id: channelId })
        .eq('id', video.id)

      if (updateError) throw updateError

      results.success++
    } catch (err: any) {
      console.error(`Failed to backfill video ${video.id}:`, err)
      results.failed++
      results.errors.push({ id: video.id, error: err.message })
    }
  }

  // 3. Update existing channels missing thumbnails
  if (channels && channels.length > 0) {
    for (const channel of channels) {
      if (channel.id.startsWith('@')) {
        try {
          const authorUrl = `https://www.youtube.com/${channel.id}`
          const thumbnail = await fetchChannelThumbnail(authorUrl)
          if (thumbnail) {
            const { error: updateError } = await supabase
              .from('channels')
              .update({ thumbnail_url: thumbnail })
              .eq('id', channel.id)
            if (updateError) throw updateError
            results.success++
          }
        } catch (err: any) {
          console.error(`Failed to fetch thumbnail for ${channel.id}:`, err)
          results.failed++
          results.errors.push({ id: channel.id, error: err.message })
        }
      }
    }
  }

  return NextResponse.json({ message: 'Backfill complete', results })
}
