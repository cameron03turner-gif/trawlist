'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface BugReportInput {
  title: string
  description: string
  category: 'ui_ux' | 'extension' | 'ratings_reviews' | 'lists_social' | 'performance' | 'account' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  steps_to_reproduce?: string
  environment?: string
  contact_email?: string
}

export async function submitBugReport(input: BugReportInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Basic validation
  if (!input.title || input.title.trim().length < 4) {
    return { error: 'Please provide a clear title (at least 4 characters).' }
  }
  if (!input.description || input.description.trim().length < 10) {
    return { error: 'Please describe the bug in detail (at least 10 characters).' }
  }

  const validCategories = ['ui_ux', 'extension', 'ratings_reviews', 'lists_social', 'performance', 'account', 'other']
  if (!validCategories.includes(input.category)) {
    return { error: 'Invalid bug category selected.' }
  }

  const validSeverities = ['low', 'medium', 'high', 'critical']
  if (!validSeverities.includes(input.severity)) {
    return { error: 'Invalid severity level selected.' }
  }

  const emailToStore = input.contact_email?.trim() || (user?.email ?? null)

  const { data, error } = await supabase
    .from('bug_reports')
    .insert({
      user_id: user?.id ?? null,
      contact_email: emailToStore,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      severity: input.severity,
      status: 'open',
      steps_to_reproduce: input.steps_to_reproduce?.trim() || null,
      environment: input.environment?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating bug report:', error)
    return { error: error.message || 'Failed to submit bug report.' }
  }

  revalidatePath('/bug-report')
  return { ok: true, report: data }
}

export async function toggleUpvoteBugReport(bugReportId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to upvote bug reports.' }
  }

  // Check if user already upvoted
  const { data: existing } = await supabase
    .from('bug_report_upvotes')
    .select('bug_report_id')
    .eq('bug_report_id', bugReportId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    // Remove upvote
    const { error } = await supabase
      .from('bug_report_upvotes')
      .delete()
      .eq('bug_report_id', bugReportId)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
  } else {
    // Insert upvote
    const { error } = await supabase
      .from('bug_report_upvotes')
      .insert({
        bug_report_id: bugReportId,
        user_id: user.id
      })

    if (error) return { error: error.message }
  }

  revalidatePath('/bug-report')
  return { ok: true, hasUpvoted: !existing }
}

export async function fetchBugReports({
  category = 'all',
  severity = 'all',
  status = 'all',
  search = '',
}: {
  category?: string
  severity?: string
  status?: string
  search?: string
} = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('bug_reports')
    .select(`
      *,
      profiles:user_id (
        username,
        display_name,
        avatar_url
      )
    `)
    .order('upvotes_count', { ascending: false })
    .order('created_at', { ascending: false })

  if (category !== 'all') {
    query = query.eq('category', category)
  }

  if (severity !== 'all') {
    query = query.eq('severity', severity)
  }

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  if (search && search.trim().length > 0) {
    query = query.or(`title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching bug reports:', error)
    return { error: error.message, reports: [] }
  }

  // Also fetch current user's upvotes if logged in
  const { data: { user } } = await supabase.auth.getUser()
  let userUpvoteIds: string[] = []
  
  if (user) {
    const { data: upvotes } = await supabase
      .from('bug_report_upvotes')
      .select('bug_report_id')
      .eq('user_id', user.id)
    
    if (upvotes) {
      userUpvoteIds = upvotes.map((u) => u.bug_report_id)
    }
  }

  const reportsWithUpvoteState = (data || []).map((report) => ({
    ...report,
    hasUpvoted: userUpvoteIds.includes(report.id),
  }))

  return { reports: reportsWithUpvoteState }
}
