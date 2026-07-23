import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const targetUserId = searchParams.get('targetUserId')

  if (!targetUserId) {
    return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const isPending = data?.status === 'pending'
  const isFollowing = !!data && (data.status === 'accepted' || !data.status)

  return NextResponse.json({
    isFollowing,
    isPending,
    status: data?.status || (data ? 'accepted' : null),
  })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const targetUserId = body?.targetUserId as string | undefined
  const action = body?.action as 'follow' | 'unfollow' | undefined

  if (!targetUserId || !action) {
    return NextResponse.json({ error: 'Missing targetUserId or action' }, { status: 400 })
  }
  
  if (user.id === targetUserId) {
    return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
  }

  if (action === 'follow') {
    // Check if target profile is private
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('is_private')
      .eq('id', targetUserId)
      .single()

    const isPrivate = Boolean(targetProfile?.is_private)
    const initialStatus = isPrivate ? 'pending' : 'accepted'

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: targetUserId,
        status: initialStatus,
      })
    
    // Ignore conflict errors if already requested/following
    if (error && error.code !== '23505') { 
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      status: initialStatus,
      isPending: isPrivate,
      isFollowing: !isPrivate,
    })
  } else if (action === 'unfollow') {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, status: null, isFollowing: false, isPending: false })
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}
