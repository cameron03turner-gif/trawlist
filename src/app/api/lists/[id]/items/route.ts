import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractVideoId, fetchOEmbed, fetchChannelThumbnail } from '@/lib/youtube'

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const listId = params.id
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  // Verify list ownership
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('owner_id')
    .eq('id', listId)
    .single()

  if (listError || !list || list.owner_id !== user.id) {
    return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const url = body?.url as string | undefined
  const note = body?.note as string | undefined
  
  if (!url) {
    return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
  }

  const videoId = extractVideoId(url)
  if (!videoId) {
    return NextResponse.json({ error: 'Invalid YouTube link' }, { status: 400 })
  }

  // Upsert video metadata just like in rate/route.ts
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

  // Determine next position
  const { data: items } = await supabase
    .from('list_items')
    .select('position')
    .eq('list_id', listId)
    .order('position', { ascending: false })
    .limit(1)
  
  const nextPosition = items && items.length > 0 ? (items[0].position || 0) + 1 : 1

  const { error } = await supabase
    .from('list_items')
    .insert({
      list_id: listId,
      video_id: videoId,
      position: nextPosition,
      note: note?.trim() || null,
    })

  if (error) {
    // Check for unique constraint violation (video already in list)
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Video is already in this list' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, videoId })
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const listId = params.id
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  // Verify list ownership
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('owner_id')
    .eq('id', listId)
    .single()

  if (listError || !list || list.owner_id !== user.id) {
    return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const videoId = searchParams.get('videoId')

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 })
  }

  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('list_id', listId)
    .eq('video_id', videoId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const listId = params.id
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  // Verify list ownership
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('owner_id')
    .eq('id', listId)
    .single()

  if (listError || !list || list.owner_id !== user.id) {
    return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (body.action === 'reorder' && Array.isArray(body.items)) {
    // Expects: items: { video_id: string, position: number }[]
    const { error } = await supabase
      .from('list_items')
      .upsert(
        body.items.map((item: any) => ({
          list_id: listId,
          video_id: item.video_id,
          position: item.position
        })),
        { onConflict: 'list_id, video_id' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  if (body.action === 'update_note' && body.video_id) {
    const { error } = await supabase
      .from('list_items')
      .update({ note: body.note?.trim() || null })
      .eq('list_id', listId)
      .eq('video_id', body.video_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
