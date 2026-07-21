import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const title = body?.title as string | undefined
  const description = body?.description as string | undefined
  const is_private = body?.is_private as boolean | undefined
  const is_ranked = body?.is_ranked as boolean | undefined

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('lists')
    .insert({
      owner_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      is_private: is_private ?? false,
      is_ranked: is_ranked ?? false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, list: data })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === userId

  let query = supabase
    .from('lists')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (!isOwner) {
    query = query.eq('is_private', false)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ lists: data })
}
