import Link from 'next/link'
import {
  Sparkles,
  ExternalLink,
  Star,
  CheckCircle2,
  Tv,
  MessageSquare,
  Bookmark,
  Zap,
  ArrowRight,
  ShieldCheck,
  Download
} from 'lucide-react'
import { CHROME_STORE_URL } from '@/lib/constants'

export const metadata = {
  title: 'Chrome Extension | Trawlist',
  description: 'Rate, review, and log YouTube videos directly while watching on YouTube with the official Trawlist Chrome Extension.',
  openGraph: {
    title: 'Chrome Extension | Trawlist',
    description: 'Rate, review, and log YouTube videos directly while watching on YouTube with the official Trawlist Chrome Extension.',
    url: 'https://www.trawlist.com/extension',
    siteName: 'Trawlist',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: 'Trawlist Chrome Extension' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chrome Extension | Trawlist',
    description: 'Rate, review, and log YouTube videos directly while watching on YouTube with the official Trawlist Chrome Extension.',
    images: ['/og-banner.jpg'],
  },
}

export default function ExtensionPage() {
  const FEATURES = [
    {
      title: 'Rate Directly on YouTube',
      desc: 'Log ratings using the 5-star scrubber control right inside YouTube video pages without switching tabs.',
      icon: Star,
    },
    {
      title: 'See Community Ratings',
      desc: 'Instantly view community average scores and review counts directly below YouTube video titles.',
      icon: Tv,
    },
    {
      title: 'Save to Custom Lists',
      desc: 'Add videos directly to your custom Trawlist lists in one click while watching on YouTube.',
      icon: Bookmark,
    },
    {
      title: 'Write Reviews',
      desc: 'Share your thoughts and log reviews without leaving YouTube.',
      icon: MessageSquare,
    },
  ]

  const HIGHLIGHTS = [
    'Free & Lightweight',
    'No intrusive ads or tracking',
    'Instant sync with your Trawlist account',
    'Supports Dark Mode',
  ]

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-12">
      {/* Hero Section */}
      <div className="bg-surface border border-amber rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber/10 border border-amber/30 text-amber text-xs font-bold uppercase tracking-wider mx-auto">
          <Sparkles size={14} className="animate-pulse" />
          <span>Official Browser Extension</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-display text-ink tracking-tight leading-tight">
          Bring Trawlist Directly into YouTube
        </h1>

        <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto leading-relaxed">
          Log ratings, write reviews, and check community scores natively on YouTube as you watch.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 bg-amber text-bg font-black rounded-full hover:brightness-110 hover:scale-105 transition-all shadow-xl shadow-amber/20 flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber"
          >
            <Download size={18} />
            <span>Add to Chrome — It&apos;s Free</span>
            <ExternalLink size={14} />
          </a>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-surface-alt border border-amber text-ink font-bold rounded-full hover:bg-surface transition-all text-xs focus:outline-none focus:ring-2 focus:ring-amber"
          >
            Explore Trawlist Web
          </Link>
        </div>

        {/* Quick Bullet List */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs text-muted font-medium">
          {HIGHLIGHTS.map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-amber" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-display text-ink">Everything You Need While Watching</h2>
          <p className="text-xs text-muted max-w-md mx-auto">
            The Trawlist extension integrates smoothly into YouTube&apos;s interface.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="bg-surface border border-amber rounded-2xl p-6 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber/10 hover:brightness-110 transition-all duration-300 space-y-3"
              >
                <div className="w-10 h-10 bg-amber/10 border border-amber/30 rounded-xl flex items-center justify-center text-amber">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold font-display text-ink">{f.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Installation Guide Card */}
      <section className="bg-surface-alt border border-amber/30 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-amber/20 pb-4">
          <div className="p-2.5 bg-amber/10 border border-amber/30 rounded-xl text-amber">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-ink">How to Install in 3 Easy Steps</h3>
            <p className="text-xs text-muted">Quick setup for Chrome, Brave, Edge, and Chromium browsers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-surface border border-amber/20 rounded-xl p-4 space-y-1.5">
            <span className="font-bold text-amber uppercase tracking-wider text-[10px] block">Step 1</span>
            <h4 className="font-bold text-ink">Open Web Store</h4>
            <p className="text-muted leading-relaxed">Click the &quot;Add to Chrome&quot; button above to open the official Web Store listing.</p>
          </div>

          <div className="bg-surface border border-amber/20 rounded-xl p-4 space-y-1.5">
            <span className="font-bold text-amber uppercase tracking-wider text-[10px] block">Step 2</span>
            <h4 className="font-bold text-ink">Click &quot;Add to Chrome&quot;</h4>
            <p className="text-muted leading-relaxed">Confirm installation in your browser popup to add Trawlist to your extensions.</p>
          </div>

          <div className="bg-surface border border-amber/20 rounded-xl p-4 space-y-1.5">
            <span className="font-bold text-amber uppercase tracking-wider text-[10px] block">Step 3</span>
            <h4 className="font-bold text-ink">Watch & Rate</h4>
            <p className="text-muted leading-relaxed">Open any YouTube video and start rating! Logins automatically sync with Trawlist.</p>
          </div>
        </div>

        <div className="pt-2 text-center">
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber text-bg font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-amber shadow-md"
          >
            <span>Download on Chrome Web Store</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </section>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-amber/30 flex items-center justify-between text-xs">
        <Link href="/" className="text-amber font-semibold hover:underline">
          &larr; Back to Trawlist Home
        </Link>
        <div className="flex items-center gap-4 text-muted">
          <Link href="/guidelines" className="hover:text-ink transition">Community Guidelines</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-ink transition">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}
