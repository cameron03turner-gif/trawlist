import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const listId = params.id
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: list, error } = await supabase
    .from('lists')
    .select(`
      *,
      owner:profiles!lists_owner_id_fkey(username, display_name, avatar_url)
    `)
    .eq('id', listId)
    .single()

  if (error || !list) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 })
  }

  // Check if private and not owner
  if (list.is_private && list.owner_id !== user?.id) {
    return NextResponse.json({ error: 'List not found or private' }, { status: 404 })
  }

  const { data: items, error: itemsError } = await supabase
    .from('list_items')
    .select(`
      position,
      note,
      added_at,
      video:videos(*)
    `)
    .eq('list_id', listId)
    .order('position', { ascending: true })

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  return NextResponse.json({ list, items })
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const listId = params.id
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('owner_id')
    .eq('id', listId)
    .single()

  if (listError || !list || list.owner_id !== user.id) {
    return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 })
  }

  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', listId)

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

  const updates: any = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description
  if (body.is_private !== undefined) updates.is_private = body.is_private
  if (body.is_ranked !== undefined) updates.is_ranked = body.is_ranked

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  }

  const { error } = await supabase
    .from('lists')
    .update(updates)
    .eq('id', listId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

