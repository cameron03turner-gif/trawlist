'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { submitContentReport, ContentReportInput } from '@/app/actions/content-reports'
import {
  Flag,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Send
} from 'lucide-react'

const REPORT_REASONS = [
  { id: 'harassment', label: 'Harassment or Bullying', desc: 'Personal attacks, targeted abuse, or intimidation' },
  { id: 'hate_speech', label: 'Hate Speech or Discrimination', desc: 'Slurs, discriminatory remarks, or hate group content' },
  { id: 'spam', label: 'Spam or Phishing', desc: 'Promotional links, repetitive comments, or scam links' },
  { id: 'piracy_copyright', label: 'Copyright or Piracy', desc: 'Unauthorized media distribution or pirated content links' },
  { id: 'inappropriate', label: 'Inappropriate Content', desc: 'Explicit, graphic, or unsafe material' },
  { id: 'impersonation', label: 'Impersonation', desc: 'Pretending to be someone else or misleading identity' },
  { id: 'other', label: 'Other Issue', desc: 'Any other violation of Community Guidelines' },
] as const

type Props = {
  isOpen: boolean
  onClose: () => void
  targetType: 'review' | 'reply' | 'list' | 'profile' | 'other'
  targetId: string
  targetTitle?: string
  targetUrl?: string
}

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  targetUrl,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [reason, setReason] = useState<ContentReportInput['reason']>('harassment')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSubmitting(true)

    try {
      const res = await submitContentReport({
        target_type: targetType,
        target_id: targetId,
        target_url: targetUrl || (typeof window !== 'undefined' ? window.location.href : undefined),
        reason,
        details,
      })

      if (res.error) {
        setErrorMsg(res.error)
      } else {
        setIsSuccess(true)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetAndClose = () => {
    setReason('harassment')
    setDetails('')
    setErrorMsg(null)
    setIsSuccess(false)
    onClose()
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={handleResetAndClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      {/* Modal Dialog Container */}
      <div
        className="relative w-full max-w-lg bg-surface border border-amber/40 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 sm:p-7 space-y-6 my-auto z-10 animate-fade-in-zoom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 text-muted hover:text-amber hover:bg-surface-alt rounded-xl transition-all"
          title="Close"
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          /* Success State */
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold font-display text-ink">Report Submitted</h3>
              <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
                Thank you for keeping Trawlist safe. Our moderation team will review this report shortly.
              </p>
            </div>
            <button
              onClick={handleResetAndClose}
              className="px-6 py-2.5 bg-amber text-bg font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-amber shadow-lg shadow-amber/20"
            >
              Close
            </button>
          </div>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3.5 border-b border-amber/20 pb-4">
              <div className="w-10 h-10 bg-amber/10 border border-amber/30 rounded-xl flex items-center justify-center text-amber shrink-0">
                <Flag size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold font-display text-ink leading-tight">Report Content</h3>
                <p className="text-xs text-muted truncate mt-0.5">
                  {targetTitle ? `Flagging: ${targetTitle}` : `Flagging this ${targetType}`}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-rec/10 border border-rec/30 text-rec text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Reason Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-amber uppercase tracking-wider">
                Reason for Report *
              </label>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1.5 scrollbar-thin">
                {REPORT_REASONS.map((r) => {
                  const isSelected = reason === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setReason(r.id as ContentReportInput['reason'])}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber/10 border-amber text-ink shadow-md ring-1 ring-amber'
                          : 'bg-surface-alt/60 border-amber/20 hover:border-amber/50 hover:bg-surface-alt text-ink/80'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <div
                          className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${
                            isSelected ? 'border-amber bg-amber/20' : 'border-muted/50 bg-bg'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-amber" />}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-amber' : 'text-ink'}`}>
                          {r.label}
                        </div>
                        <div className="text-[11px] text-muted leading-relaxed mt-0.5">
                          {r.desc}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Optional Context Details */}
            <div className="space-y-1.5">
              <label htmlFor="report-details" className="block text-[11px] font-bold text-amber uppercase tracking-wider">
                Additional Context (Optional)
              </label>
              <textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={2}
                placeholder="Provide any extra context to help our moderation team..."
                className="w-full bg-surface-alt/70 border border-amber/30 rounded-xl p-3 text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber focus:border-amber transition-all resize-y"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber/20">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 py-2.5 bg-surface-alt border border-amber/30 text-ink font-semibold text-xs rounded-xl hover:bg-surface-alt/80 hover:text-amber transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber text-bg font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg shadow-amber/20 transition-all focus:outline-none focus:ring-2 focus:ring-amber disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send size={13} /> Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
