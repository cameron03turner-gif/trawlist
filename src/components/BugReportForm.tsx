'use client'

import { useState } from 'react'
import { submitBugReport, BugReportInput } from '@/app/actions/bug-reports'
import {
  Bug,
  Layout,
  Puzzle,
  Star,
  Users,
  Zap,
  User,
  HelpCircle,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Send,
  Loader2,
  Laptop,
  Mail,
  FileText
} from 'lucide-react'

const CATEGORIES = [
  { id: 'ui_ux', label: 'UI / UX Design', icon: Layout, desc: 'Visual bugs & layout glitches' },
  { id: 'extension', label: 'Chrome Extension', icon: Puzzle, desc: 'Video sync & extension overlay' },
  { id: 'ratings_reviews', label: 'Ratings & Reviews', icon: Star, desc: 'Scores, reviews & watch status' },
  { id: 'lists_social', label: 'Lists & Community', icon: Users, desc: 'Playlists, follows & feed bugs' },
  { id: 'performance', label: 'Performance & Speed', icon: Zap, desc: 'Slow loading & unresponsiveness' },
  { id: 'account', label: 'Account & Settings', icon: User, desc: 'Login, profile & settings issues' },
  { id: 'other', label: 'Other Issue', icon: HelpCircle, desc: 'General feedback & other issues' },
] as const

const SEVERITIES = [
  { id: 'low', label: 'Low', desc: 'Minor flaw, workaround available', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { id: 'medium', label: 'Medium', desc: 'Partially broken, annoying but usable', badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { id: 'high', label: 'High', desc: 'Core feature fails or data unsaved', badgeClass: 'bg-amber/10 text-amber border-amber/30' },
  { id: 'critical', label: 'Critical', desc: 'App crash or blocking issue', badgeClass: 'bg-rec/10 text-rec border-rec/30' },
] as const

export function BugReportForm({ 
  userEmail, 
  onReportSubmitted 
}: { 
  userEmail?: string | null
  onReportSubmitted?: () => void 
}) {
  const [category, setCategory] = useState<BugReportInput['category']>('ui_ux')
  const [severity, setSeverity] = useState<BugReportInput['severity']>('medium')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stepsToReproduce, setStepsToReproduce] = useState('')
  const [environment, setEnvironment] = useState('')
  const [contactEmail, setContactEmail] = useState(userEmail || '')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successReport, setSuccessReport] = useState<any | null>(null)

  const handleAutoDetectEnv = () => {
    if (typeof window === 'undefined') return
    const ua = navigator.userAgent
    let browserName = 'Browser'
    if (ua.includes('Firefox')) browserName = 'Firefox'
    else if (ua.includes('Edg')) browserName = 'Edge'
    else if (ua.includes('Chrome')) browserName = 'Chrome'
    else if (ua.includes('Safari')) browserName = 'Safari'

    let osName = 'OS'
    if (ua.includes('Win')) osName = 'Windows'
    else if (ua.includes('Mac')) osName = 'macOS'
    else if (ua.includes('Linux')) osName = 'Linux'
    else if (ua.includes('Android')) osName = 'Android'
    else if (ua.includes('iPhone') || ua.includes('iPad')) osName = 'iOS'

    const detected = `${browserName} / ${osName} (${window.innerWidth}x${window.innerHeight})`
    setEnvironment(detected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSubmitting(true)

    try {
      const res = await submitBugReport({
        title,
        description,
        category,
        severity,
        steps_to_reproduce: stepsToReproduce,
        environment,
        contact_email: contactEmail,
      })

      if (res.error) {
        setErrorMsg(res.error)
      } else if (res.ok && res.report) {
        setSuccessReport(res.report)
        if (onReportSubmitted) onReportSubmitted()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setTitle('')
    setDescription('')
    setStepsToReproduce('')
    setEnvironment('')
    setErrorMsg(null)
    setSuccessReport(null)
  }

  if (successReport) {
    return (
      <div className="bg-surface border border-amber rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-xl animate-fade-in">
        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold font-display text-ink">Bug Report Submitted!</h3>
          <p className="text-sm text-muted max-w-md mx-auto">
            Thank you for helping us make Trawlist better. Our engineering team has received your ticket.
          </p>
        </div>

        <div className="bg-surface-alt border border-amber/20 rounded-xl p-4 text-left space-y-2 max-w-lg mx-auto text-xs text-ink/90">
          <div className="flex justify-between border-b border-amber/10 pb-2">
            <span className="text-muted">Ticket ID:</span>
            <span className="font-mono font-bold text-amber">{successReport.id}</span>
          </div>
          <div className="flex justify-between border-b border-amber/10 pb-2">
            <span className="text-muted">Title:</span>
            <span className="font-semibold">{successReport.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Status:</span>
            <span className="capitalize px-2 py-0.5 rounded bg-amber/10 text-amber font-bold text-[10px]">
              {successReport.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber text-bg font-semibold text-xs rounded-xl hover:brightness-110 hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-amber"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-amber rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-amber/20 pb-4">
        <div className="p-2.5 bg-amber/10 border border-amber/30 rounded-xl text-amber">
          <Bug className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold font-display text-ink">Submit a Bug Report</h2>
          <p className="text-xs text-muted">Found an issue or glitch on Trawlist? Let us know so we can fix it promptly.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rec/10 border border-rec/30 text-rec text-xs p-3.5 rounded-xl flex items-center gap-2">
          <AlertOctagon size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Category Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-ink uppercase tracking-wider">Category *</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isSelected = category === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id as BugReportInput['category'])}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber/10 border-amber text-amber shadow-sm ring-1 ring-amber'
                    : 'bg-surface-alt border-amber/20 hover:border-amber/50 text-ink/80 hover:brightness-110'
                }`}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-amber' : 'text-muted'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-ink leading-tight">{cat.label}</div>
                  <div className="text-[11px] text-muted leading-tight mt-0.5">{cat.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Severity Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-ink uppercase tracking-wider">Severity Level *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SEVERITIES.map((sev) => {
            const isSelected = severity === sev.id
            return (
              <button
                key={sev.id}
                type="button"
                onClick={() => setSeverity(sev.id as BugReportInput['severity'])}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? `${sev.badgeClass} ring-1 ring-amber/50 font-bold`
                    : 'bg-surface-alt border-amber/20 text-muted hover:border-amber/40'
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-wider">{sev.label}</div>
                <div className="text-[10px] opacity-80 leading-tight mt-1">{sev.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bug Title */}
      <div className="space-y-1.5">
        <label htmlFor="bug-title" className="block text-xs font-semibold text-ink uppercase tracking-wider">
          Title / Summary *
        </label>
        <input
          id="bug-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Chrome Extension sync button is unresponsive on video pages"
          required
          className="w-full bg-surface-alt border border-amber/30 rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber transition-all"
        />
      </div>

      {/* Detailed Description */}
      <div className="space-y-1.5">
        <label htmlFor="bug-desc" className="block text-xs font-semibold text-ink uppercase tracking-wider">
          Detailed Description *
        </label>
        <textarea
          id="bug-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Explain what went wrong, what you expected to happen, and any details that might help..."
          required
          className="w-full bg-surface-alt border border-amber/30 rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber transition-all resize-y"
        />
      </div>

      {/* Steps to Reproduce */}
      <div className="space-y-1.5">
        <label htmlFor="bug-steps" className="block text-xs font-semibold text-ink uppercase tracking-wider flex items-center justify-between">
          <span>Steps to Reproduce (Optional)</span>
          <span className="text-[10px] text-muted normal-case font-normal">1. Click X... 2. Open Y...</span>
        </label>
        <textarea
          id="bug-steps"
          value={stepsToReproduce}
          onChange={(e) => setStepsToReproduce(e.target.value)}
          rows={2}
          placeholder="1. Go to YouTube video page&#10;2. Open Trawlist extension drawer&#10;3. Click 'Save Rating'..."
          className="w-full bg-surface-alt border border-amber/30 rounded-xl px-3.5 py-2.5 text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber transition-all resize-y"
        />
      </div>

      {/* Environment & Contact Email Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Environment */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="bug-env" className="block text-xs font-semibold text-ink uppercase tracking-wider">
              Environment / Device
            </label>
            <button
              type="button"
              onClick={handleAutoDetectEnv}
              className="text-[11px] text-amber hover:underline flex items-center gap-1"
            >
              <Laptop size={12} /> Auto-detect
            </button>
          </div>
          <input
            id="bug-env"
            type="text"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            placeholder="e.g. Chrome 124 / Windows 11"
            className="w-full bg-surface-alt border border-amber/30 rounded-xl px-3.5 py-2 text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber transition-all"
          />
        </div>

        {/* Contact Email */}
        <div className="space-y-1.5">
          <label htmlFor="bug-email" className="block text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1">
            <Mail size={12} /> Contact Email (for updates)
          </label>
          <input
            id="bug-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-surface-alt border border-amber/30 rounded-xl px-3.5 py-2 text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber transition-all"
          />
        </div>
      </div>

      {/* Form Submission Controls */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber/20">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-amber text-bg font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-amber disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Submit Report
            </>
          )}
        </button>
      </div>
    </form>
  )
}
