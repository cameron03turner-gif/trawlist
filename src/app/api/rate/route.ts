import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractVideoId, fetchOEmbed, fetchChannelThumbnail } from '@/lib/youtube'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const url = body?.url as string | undefined
  const ratingRaw = body?.rating
  const rating = ratingRaw !== undefined && ratingRaw !== null ? Number(ratingRaw) : null
  const review = body?.review as string | undefined
  const note = body?.note as string | undefined
  const watch_status = body?.watch_status as string | undefined
  const liked = body?.liked as boolean | undefined

  const videoId = url ? extractVideoId(url) : null
  if (!videoId) {
    return NextResponse.json({ error: 'Invalid YouTube link' }, { status: 400 })
  }
  if (rating !== null && (Number.isNaN(rating) || rating < 0 || rating > 5)) {
    return NextResponse.json({ error: 'Rating must be between 0 and 5' }, { status: 400 })
  }
  if (rating === null && !watch_status) {
    return NextResponse.json({ error: 'Must provide either a rating or a watch status' }, { status: 400 })
  }

  const { data: existingVideo } = await supabase.from('videos').select('id').eq('id', videoId).maybeSingle()

  if (!existingVideo) {
    const meta = await fetchOEmbed(videoId)
    if (!meta) {
      return NextResponse.json({ error: 'Could not find that video' }, { status: 404 })
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
      return NextResponse.json({ error: videoError.message }, { status: 500 })
    }
  }

  const { error: ratingError } = await supabase.from('ratings').upsert(
    {
      user_id: user.id,
      video_id: videoId,
      rating,
      review: review?.trim() || null,
      note: note?.trim() || null,
      watch_status: watch_status || null,
      liked: liked ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,video_id' }
  )

  if (ratingError) {
    return NextResponse.json({ error: ratingError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, videoId })
}
