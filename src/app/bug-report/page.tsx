import { createClient } from '@/lib/supabase/server'
import { SystemStatusBanner } from '@/components/SystemStatusBanner'
import { BugReportForm } from '@/components/BugReportForm'
import { BugTrackerBoard } from '@/components/BugTrackerBoard'
import { Bug, AlertCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Bug Report & Tracker | Trawlist',
  description: 'Report issues, view platform status, and track community bug fixes on Trawlist.',
}

export default async function BugReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber/30 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-ink tracking-tight">Bug Report & Support Hub</h1>
          <p className="text-sm text-muted mt-1">
            Help us improve Trawlist! Report technical issues, track fix progress, or upvote known issues.
          </p>
        </div>
      </div>

      {/* System Status Indicators */}
      <SystemStatusBanner />

      {/* Main Content Sections */}
      <div className="space-y-8">
        {/* Submit Bug Section */}
        <section className="space-y-4">
          <BugReportForm userEmail={user?.email} />
        </section>

        {/* Known Issues & Bug Tracker Board */}
        <section className="space-y-4 pt-4 border-t border-amber/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-display text-ink flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber" /> Known Issues & Community Tracker
              </h2>
              <p className="text-xs text-muted">Browse reported bugs, check resolutions, or upvote issues you are also experiencing.</p>
            </div>
          </div>

          <BugTrackerBoard isLoggedIn={!!user} />
        </section>
      </div>

      {/* Footer Back Link */}
      <div className="pt-6 border-t border-amber/30 flex items-center justify-between text-xs">
        <Link href="/" className="text-amber font-semibold hover:underline">
          &larr; Back to Trawlist Home
        </Link>
        <Link href="/terms" className="text-muted hover:text-ink transition">
          Terms of Service
        </Link>
      </div>
    </div>
  )
}
