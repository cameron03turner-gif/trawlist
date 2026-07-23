'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ContentReportInput {
  target_type: 'review' | 'reply' | 'list' | 'profile' | 'other'
  target_id: string
  target_url?: string
  reason: 'harassment' | 'hate_speech' | 'spam' | 'piracy_copyright' | 'inappropriate' | 'impersonation' | 'other'
  details?: string
}

export async function submitContentReport(input: ContentReportInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!input.target_id || !input.target_type) {
    return { error: 'Invalid content target specified.' }
  }

  const validTypes = ['review', 'reply', 'list', 'profile', 'other']
  if (!validTypes.includes(input.target_type)) {
    return { error: 'Invalid target type.' }
  }

  const validReasons = ['harassment', 'hate_speech', 'spam', 'piracy_copyright', 'inappropriate', 'impersonation', 'other']
  if (!validReasons.includes(input.reason)) {
    return { error: 'Please select a valid report reason.' }
  }

  const { data, error } = await supabase
    .from('content_reports')
    .insert({
      reporter_id: user?.id ?? null,
      target_type: input.target_type,
      target_id: input.target_id,
      target_url: input.target_url || null,
      reason: input.reason,
      details: input.details?.trim() || null,
      status: 'open',
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting content report:', error)
    return { error: error.message || 'Failed to submit report.' }
  }

  return { ok: true, report: data }
}
