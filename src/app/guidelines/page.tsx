import Link from 'next/link'
import {
  ShieldCheck,
  HeartHandshake,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Star,
  ListVideo,
  UserX,
  Flag,
  CheckCircle2,
  HelpCircle
} from 'lucide-react'

export const metadata = {
  title: 'Community Guidelines | Trawlist',
  description: 'Standards of conduct, review etiquette, and moderation policies for the Trawlist community.',
}

export default function GuidelinesPage() {
  const PILLARS = [
    {
      title: 'Respectful Discussion',
      desc: 'Treat creators and community members with kindness. Critique content constructively without personal attacks.',
      icon: HeartHandshake,
    },
    {
      title: 'Authentic Ratings',
      desc: 'Log genuine watch activity and honest scores. Score manipulation, botting, or vote brigading is strictly forbidden.',
      icon: Star,
    },
    {
      title: 'Constructive Reviews',
      desc: 'Write meaningful reviews and thoughts that add value to fellow video enthusiasts.',
      icon: MessageSquare,
    },
    {
      title: 'Thoughtful Curation',
      desc: 'Build creative playlists and lists that help others discover high-quality content across YouTube.',
      icon: ListVideo,
    },
  ]

  const RULES = [
    {
      number: '1',
      title: 'Zero Tolerance for Hate Speech & Harassment',
      content:
        'We do not tolerate harassment, bullying, hate speech, threats of violence, discrimination (based on race, gender, sexuality, religion, or disability), or doxxing of creators or community members.',
    },
    {
      number: '2',
      title: 'Keep Reviews & Comments Constructive',
      content:
        'Disagreeing with a video or creator is completely acceptable, but keep feedback focused on the video, ideas, and production value. Avoid personal insults, defamatory claims, or malicious spam.',
    },
    {
      number: '3',
      title: 'No Rating Manipulation, Bots, or Spam',
      content:
        'Do not create multiple fake accounts to artificially inflate or lower video ratings, spam review sections with affiliate links, or mass-upvote content. All logs must reflect real user activity.',
    },
    {
      number: '4',
      title: 'Respect Intellectual Property & Content Safety',
      content:
        'Do not post links to pirated content, malware, phishing sites, or sexually explicit material in reviews, notes, list descriptions, or user profile handles.',
    },
    {
      number: '5',
      title: 'Protect Privacy in Public Content',
      content:
        'Private Notes are visible only to you, but Public Reviews, Lists, and Profile details are shared with the community. Ensure public content adheres to these guidelines.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-10">
      {/* Header Banner */}
      <div className="border-b border-amber/30 pb-6 space-y-2">
        <h1 className="text-3xl font-bold font-display text-ink tracking-tight">Community Guidelines</h1>
        <p className="text-sm text-muted max-w-2xl">
          Trawlist is built for video enthusiasts to discover, rate, review, and curate content. These guidelines ensure our community remains welcoming, authentic, and inspiring for everyone.
        </p>
      </div>

      {/* Core Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PILLARS.map((p) => {
          const Icon = p.icon
          return (
            <div
              key={p.title}
              className="bg-surface border border-amber rounded-2xl p-5 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber/10 hover:brightness-110 transition-all duration-300 space-y-2"
            >
              <div className="w-9 h-9 bg-amber/10 border border-amber/30 rounded-xl flex items-center justify-center text-amber">
                <Icon size={18} />
              </div>
              <h3 className="text-base font-bold font-display text-ink">{p.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{p.desc}</p>
            </div>
          )
        })}
      </div>

      {/* Detailed Rules */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber" />
          <h2 className="text-xl font-bold font-display text-ink">Community Rules & Expectations</h2>
        </div>

        <div className="space-y-3">
          {RULES.map((rule) => (
            <div
              key={rule.number}
              className="bg-surface border border-amber/30 rounded-2xl p-4 sm:p-5 hover:border-amber transition-colors flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-xl bg-amber text-bg font-bold font-mono text-sm flex items-center justify-center shrink-0 shadow-sm">
                {rule.number}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-ink">{rule.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{rule.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Moderation & Enforcement Policy */}
      <section className="bg-surface border border-amber rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-amber/20 pb-3">
          <div className="p-2 bg-amber/10 border border-amber/30 rounded-xl text-amber">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-ink">Enforcement & Moderation</h2>
            <p className="text-xs text-muted">How we handle violations to protect the community</p>
          </div>
        </div>

        <p className="text-xs text-ink/90 leading-relaxed">
          When violations occur, our moderation team takes action based on severity and account history. Actions may include:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-surface-alt border border-amber/20 rounded-xl p-3 space-y-1">
            <span className="font-bold text-amber uppercase tracking-wider text-[10px] block">1. Warning & Content Removal</span>
            <p className="text-muted">Offending reviews, lists, or spam content are removed, and a warning is issued.</p>
          </div>

          <div className="bg-surface-alt border border-amber/20 rounded-xl p-3 space-y-1">
            <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px] block">2. Account Suspension</span>
            <p className="text-muted">Repeated or serious violations result in temporary account suspension.</p>
          </div>

          <div className="bg-surface-alt border border-amber/20 rounded-xl p-3 space-y-1">
            <span className="font-bold text-rec uppercase tracking-wider text-[10px] block">3. Permanent Ban</span>
            <p className="text-muted">Severe violations (hate speech, doxxing, automated spamming) lead to permanent account termination.</p>
          </div>
        </div>
      </section>

      {/* Reporting Violations Callout */}
      <div className="bg-surface-alt border border-amber/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber/10 border border-amber/30 rounded-xl text-amber shrink-0">
            <Flag size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">Found a Violation or Bug?</h3>
            <p className="text-xs text-muted">Help keep Trawlist clean by reporting inappropriate content or technical issues.</p>
          </div>
        </div>

        <Link
          href="/bug-report"
          className="px-4 py-2 bg-amber text-bg text-xs font-bold uppercase tracking-wider rounded-xl hover:brightness-110 hover:scale-[1.02] transition-all shrink-0"
        >
          Report an Issue
        </Link>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-amber/30 flex items-center justify-between text-xs">
        <Link href="/" className="text-amber font-semibold hover:underline">
          &larr; Back to Trawlist Home
        </Link>
        <div className="flex items-center gap-4 text-muted">
          <Link href="/terms" className="hover:text-ink transition">Terms of Service</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-ink transition">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}
