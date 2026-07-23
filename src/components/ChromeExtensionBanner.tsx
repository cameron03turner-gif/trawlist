import Link from 'next/link'
import { Sparkles, ExternalLink, Download, Star, Tv, CheckCircle2 } from 'lucide-react'
import { CHROME_STORE_URL } from '@/lib/constants'

type Props = {
  variant?: 'landing' | 'dashboard' | 'compact'
}

export function ChromeExtensionBanner({ variant = 'landing' }: Props) {
  if (variant === 'dashboard') {
    return (
      <div className="bg-surface border border-amber rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber/10 border border-amber/30 flex items-center justify-center text-amber shrink-0 shadow-inner">
            <Tv size={24} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-display text-ink">Rate Videos Directly on YouTube</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber/10 border border-amber/30 text-amber font-bold text-[10px] uppercase tracking-wider">
                Chrome Extension
              </span>
            </div>
            <p className="text-xs text-muted max-w-xl">
              Get the official Trawlist browser extension to log ratings, view community scores, and save videos to your custom lists without leaving YouTube.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-amber text-bg font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-amber shadow-md flex items-center justify-center gap-1.5"
          >
            <Download size={14} />
            <span>Get Extension</span>
            <ExternalLink size={12} />
          </a>
          <Link
            href="/extension"
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-surface-alt border border-amber/30 text-ink font-semibold text-xs rounded-xl hover:bg-surface hover:text-amber transition-all text-center"
          >
            Learn More
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-amber rounded-3xl p-6 sm:p-10 shadow-2xl shadow-amber/10 relative overflow-hidden my-8">
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        <div className="space-y-4 text-center lg:text-left max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber/10 border border-amber/30 text-amber text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="animate-pulse" />
            <span>Official Chrome Extension</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-ink font-display leading-tight">
            Rate & Review Videos As You Watch on YouTube
          </h2>

          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Install the Trawlist Chrome extension to log 5-star ratings, write reviews, and save videos to your custom lists directly on YouTube video pages.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-muted font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-amber" /> Direct YouTube Integration
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-amber" /> Instant Account Sync
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-amber" /> 100% Free
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 shrink-0 w-full sm:w-auto lg:w-64">
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-6 py-3.5 bg-amber text-bg font-black rounded-full hover:brightness-110 hover:scale-105 transition-all shadow-xl shadow-amber/20 text-xs uppercase tracking-wider flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber"
          >
            <Download size={16} />
            <span>Add to Chrome</span>
            <ExternalLink size={14} />
          </a>

          <Link
            href="/extension"
            className="w-full px-6 py-3 bg-surface-alt border border-amber text-ink font-bold rounded-full hover:bg-surface transition-all text-xs text-center focus:outline-none focus:ring-2 focus:ring-amber"
          >
            View Extension Details
          </Link>
        </div>
      </div>
    </div>
  )
}
