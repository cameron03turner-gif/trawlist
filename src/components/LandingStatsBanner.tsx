'use client'

import { Film, MessageSquare, ListVideo, Users } from 'lucide-react'

export function LandingStatsBanner() {
  const stats = [
    { icon: Film, label: 'Videos Rated & Logged', value: '14,800+' },
    { icon: MessageSquare, label: 'Community Reviews', value: '4,200+' },
    { icon: ListVideo, label: 'Curated Playlists', value: '1,600+' },
  ]

  return (
    <div className="w-full bg-transparent border-y border-amber/20 py-12 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center text-center md:text-left">
          {/* Social Proof Avatar Stack */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-amber bg-amber/20 text-amber font-bold flex items-center justify-center text-xs shadow-md">
                AL
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-amber bg-surface-alt text-ink font-bold flex items-center justify-center text-xs shadow-md">
                SK
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-amber bg-bg text-amber font-bold flex items-center justify-center text-xs shadow-md">
                MX
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-amber bg-amber text-bg font-black flex items-center justify-center text-xs shadow-md">
                +2k
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
              <Users size={14} className="text-amber" />
              <span>Join 2,000+ Video Enthusiasts</span>
            </div>
          </div>

          {/* Stat Counters */}
          {stats.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="aero-inset p-4 rounded-xl flex items-center gap-4 hover:scale-[1.02] hover:shadow-amber/10 transition-all duration-300"
              >
                <div className="p-3 bg-amber/10 text-amber rounded-lg border border-amber/30">
                  <Icon size={22} />
                </div>
                <div>
                  <div className="text-2xl font-display font-black text-ink">{item.value}</div>
                  <div className="text-xs text-muted font-medium">{item.label}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
