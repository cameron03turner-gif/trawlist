'use client'

import { useState, useEffect } from 'react'
import { fetchBugReports, toggleUpvoteBugReport } from '@/app/actions/bug-reports'
import { Avatar } from '@/components/Avatar'
import {
  Bug,
  Search,
  Filter,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layout,
  Puzzle,
  Star,
  Users,
  Zap,
  User,
  Loader2,
  Tag,
  Laptop
} from 'lucide-react'
import Link from 'next/link'

const CATEGORY_MAP: Record<string, { label: string; icon: any }> = {
  ui_ux: { label: 'UI / UX', icon: Layout },
  extension: { label: 'Chrome Extension', icon: Puzzle },
  ratings_reviews: { label: 'Ratings & Reviews', icon: Star },
  lists_social: { label: 'Lists & Community', icon: Users },
  performance: { label: 'Performance', icon: Zap },
  account: { label: 'Account', icon: User },
  other: { label: 'Other', icon: HelpCircle },
}

const SEVERITY_BADGES: Record<string, { label: string; style: string }> = {
  low: { label: 'Low', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  medium: { label: 'Medium', style: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  high: { label: 'High', style: 'bg-amber/10 text-amber border-amber/30' },
  critical: { label: 'Critical', style: 'bg-rec/10 text-rec border-rec/30' },
}

const STATUS_BADGES: Record<string, { label: string; style: string; icon: any }> = {
  open: { label: 'Open', style: 'bg-amber/10 text-amber border-amber/30', icon: AlertCircle },
  under_review: { label: 'Under Review', style: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Clock },
  in_progress: { label: 'In Progress', style: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Loader2 },
  resolved: { label: 'Resolved', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  closed: { label: 'Closed', style: 'bg-surface-alt text-muted border-border', icon: CheckCircle2 },
}

export function BugTrackerBoard({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [upvoteLoadingMap, setUpvoteLoadingMap] = useState<Record<string, boolean>>({})

  const loadReports = async () => {
    setIsLoading(true)
    const res = await fetchBugReports({
      category: selectedCategory,
      severity: selectedSeverity,
      status: selectedStatus,
      search: search,
    })
    setReports(res.reports || [])
    setIsLoading(false)
  }

  useEffect(() => {
    loadReports()
  }, [selectedCategory, selectedSeverity, selectedStatus, search])

  const handleUpvote = async (e: React.MouseEvent, bugId: string) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      alert('Please sign in to upvote bug reports!')
      return
    }

    setUpvoteLoadingMap((prev) => ({ ...prev, [bugId]: true }))

    // Optimistic UI update
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === bugId) {
          const newHasUpvoted = !r.hasUpvoted
          const countChange = newHasUpvoted ? 1 : -1
          return {
            ...r,
            hasUpvoted: newHasUpvoted,
            upvotes_count: Math.max(0, (r.upvotes_count || 0) + countChange),
          }
        }
        return r
      })
    )

    const res = await toggleUpvoteBugReport(bugId)

    if (res.error) {
      // Rollback on error
      loadReports()
    }

    setUpvoteLoadingMap((prev) => ({ ...prev, [bugId]: false }))
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-surface border border-amber rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reported issues by title or keyword..."
              className="w-full bg-surface-alt border border-amber/30 rounded-xl pl-9 pr-4 py-2 text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber transition-all"
            />
          </div>

          {/* Status Select */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-surface-alt border border-amber/30 text-ink text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-1.5 px-0.5 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl border font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber text-bg border-amber shadow-md shadow-amber/20'
                : 'bg-surface-alt border-amber/20 text-muted hover:text-ink hover:border-amber/50'
            }`}
          >
            All Categories
          </button>
          {Object.entries(CATEGORY_MAP).map(([key, cat]) => {
            const Icon = cat.icon
            const isSelected = selectedCategory === key
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber text-bg border-amber shadow-md shadow-amber/20'
                    : 'bg-surface-alt border-amber/20 text-muted hover:text-ink hover:border-amber/50'
                }`}
              >
                <Icon size={13} className="shrink-0" />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-surface-alt border border-amber/20 rounded-2xl p-4 h-24" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        /* Empty State */
        <div className="bg-surface border border-amber/30 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-surface-alt border border-amber/20 rounded-full flex items-center justify-center mx-auto text-muted">
            <Bug className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-ink font-display">No bug reports found</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {search || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'No issues match your current search or filter criteria. Try resetting filters.'
              : 'No open bugs reported yet! Be the first to submit an issue using the form above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const CatConfig = CATEGORY_MAP[report.category] || CATEGORY_MAP.other
            const CatIcon = CatConfig.icon
            const SevConfig = SEVERITY_BADGES[report.severity] || SEVERITY_BADGES.medium
            const StatusConfig = STATUS_BADGES[report.status] || STATUS_BADGES.open
            const StatusIcon = StatusConfig.icon
            const isExpanded = expandedId === report.id
            const isUpvoting = upvoteLoadingMap[report.id]

            return (
              <div
                key={report.id}
                onClick={() => toggleExpand(report.id)}
                className="bg-surface border border-amber rounded-2xl p-4 hover:scale-[1.01] hover:shadow-xl hover:shadow-amber/10 hover:brightness-105 transition-all duration-300 cursor-pointer space-y-3"
              >
                {/* Main Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Upvote Button */}
                    <button
                      type="button"
                      onClick={(e) => handleUpvote(e, report.id)}
                      disabled={isUpvoting}
                      className={`flex flex-col items-center justify-center min-w-11 py-2 px-2 rounded-xl border transition-all ${
                        report.hasUpvoted
                          ? 'bg-amber/10 border-amber text-amber font-bold shadow-sm'
                          : 'bg-surface-alt border-amber/20 text-muted hover:border-amber/50 hover:text-amber'
                      }`}
                      title={report.hasUpvoted ? 'Remove upvote' : 'I am experiencing this bug too'}
                    >
                      <ThumbsUp size={14} className={report.hasUpvoted ? 'fill-amber' : ''} />
                      <span className="text-xs font-semibold mt-0.5">{report.upvotes_count || 0}</span>
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${StatusConfig.style}`}>
                          <StatusIcon size={11} /> {StatusConfig.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${SevConfig.style}`}>
                          {SevConfig.label} Severity
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                          <CatIcon size={12} /> {CatConfig.label}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-ink leading-snug break-words">{report.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-muted">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Quick Snippet */}
                <p className={`text-xs text-ink/80 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                  {report.description}
                </p>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="pt-3 border-t border-amber/20 space-y-3 text-xs text-ink/90 animate-fade-in">
                    {report.steps_to_reproduce && (
                      <div className="bg-surface-alt border border-amber/20 rounded-xl p-3 space-y-1">
                        <span className="font-semibold text-amber uppercase tracking-wider text-[10px] block">
                          Steps to Reproduce:
                        </span>
                        <p className="whitespace-pre-line text-muted">{report.steps_to_reproduce}</p>
                      </div>
                    )}

                    {report.environment && (
                      <div className="flex items-center gap-2 text-muted text-[11px]">
                        <Laptop size={13} className="text-amber shrink-0" />
                        <span>Environment: {report.environment}</span>
                      </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                      <div className="flex items-center gap-2">
                        {report.profiles?.username ? (
                          <Link href={`/u/${report.profiles.username}`} className="flex items-center gap-1.5 hover:text-amber transition">
                            <Avatar
                              url={report.profiles.avatar_url}
                              username={report.profiles.username}
                              displayName={report.profiles.display_name}
                              className="w-4 h-4 text-[8px]"
                            />
                            <span>@{report.profiles.username}</span>
                          </Link>
                        ) : (
                          <span>Submitted by Guest</span>
                        )}
                      </div>

                      <span>Reported {new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
