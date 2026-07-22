import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ratingId } = await params
  if (!ratingId) {
    return NextResponse.json({ error: 'Rating ID required' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    const { data: replies, error } = await supabase
      .from('review_replies')
      .select(`
        *,
        profile:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('rating_id', ratingId)
      .order('created_at', { ascending: true })

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ replies: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ replies: replies || [] })
  } catch (err: any) {
    return NextResponse.json({ replies: [] })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ratingId } = await params
  if (!ratingId) {
    return NextResponse.json({ error: 'Rating ID required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { content, parentReplyId } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 })
    }

    const { data: inserted, error } = await supabase
      .from('review_replies')
      .insert({
        rating_id: ratingId,
        user_id: user.id,
        content: content.trim(),
        parent_reply_id: parentReplyId || null,
      })
      .select(`
        *,
        profile:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reply: inserted })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
