'use client'

import { useState } from 'react'
import { Scrubber } from '@/components/Scrubber'
import { Star, Heart, MessageSquare, ListVideo, Sparkles, CheckCircle2, Film, Plus } from 'lucide-react'

export function InteractiveLandingDemo() {
  const [activeTab, setActiveTab] = useState<'rate' | 'feed' | 'list'>('rate')
  
  // Interactive Rating State
  const [demoRating, setDemoRating] = useState<number | null>(4.5)
  const [hasRated, setHasRated] = useState(false)
  const [liked, setLiked] = useState(false)

  // Interactive Feed State
  const [feedLiked, setFeedLiked] = useState(false)
  const [feedLikesCount, setFeedLikesCount] = useState(14)

  // Interactive List State
  const [listItems, setListItems] = useState([
    { id: '1', title: 'Why Japanese RPGs Feel Magical', channel: 'Cine-Nerd', duration: '24:12', rating: 4.8 },
    { id: '2', title: 'The Lost Art of CRT Monitors', channel: 'Tech Nostalgia', duration: '18:45', rating: 4.6 },
    { id: '3', title: 'Building a Synthesizer from Scratch', channel: 'SoundCraft', duration: '32:10', rating: 4.9 },
  ])
  const [newTitle, setNewTitle] = useState('')

  const handleRateChange = (val: number | null) => {
    setDemoRating(val)
    setHasRated(true)
  }

  const handleAddListItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setListItems([
      ...listItems,
      {
        id: String(Date.now()),
        title: newTitle.trim(),
        channel: 'Your Curation',
        duration: '15:00',
        rating: 5.0,
      },
    ])
    setNewTitle('')
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-bg/40 border border-amber/30 rounded-2xl p-6 sm:p-8 my-12 relative overflow-hidden">
      {/* Subtle Background Shimmer Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Demo Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-border mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber animate-pulse" size={20} />
          <h2 className="text-xl font-bold font-display text-ink">Interactive Playground</h2>
          <span className="text-xs bg-amber/20 text-amber font-semibold px-2.5 py-0.5 rounded-full border border-amber/40">Try it now</span>
        </div>

        {/* Segmented Control */}
        <div className="flex items-center bg-bg/80 border border-border p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('rate')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'rate'
                ? 'bg-amber text-bg shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Star size={14} className={activeTab === 'rate' ? 'fill-bg' : ''} />
            Rate Video
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'feed'
                ? 'bg-amber text-bg shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <MessageSquare size={14} />
            Social Feed
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-amber text-bg shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <ListVideo size={14} />
            Curate Lists
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Rating Showcase */}
      {activeTab === 'rate' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-in fade-in-0 duration-300">
          <div className="md:col-span-6 relative group rounded-xl overflow-hidden border border-amber/40 shadow-lg">
            <img
              src="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
              alt="Sample video thumbnail"
              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
              <span className="text-xs text-amber font-mono font-semibold">124K views • 28 mins</span>
              <h3 className="text-base font-bold text-white leading-tight">The Architectural Wonders of Retro Cinema</h3>
              <p className="text-xs text-muted">by FilmEssayist</p>
            </div>
          </div>

          <div className="md:col-span-6 flex flex-col justify-center space-y-4 bg-surface-alt/60 p-5 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Test Rating Scrubber</span>
              {hasRated && (
                <span className="flex items-center gap-1 text-xs text-amber font-semibold animate-in fade-in-0">
                  <CheckCircle2 size={14} /> Saved to log!
                </span>
              )}
            </div>

            <div className="bg-bg/90 p-4 rounded-xl border border-amber/30 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-display font-black text-amber">
                  {demoRating !== null ? demoRating.toFixed(1) : '0.0'}
                </span>
                <span className="text-xs text-muted font-medium">/ 5.0 Stars</span>
              </div>
              <Scrubber value={demoRating} onChange={handleRateChange} height={24} />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  liked
                    ? 'bg-rec/10 border-rec text-rec'
                    : 'bg-bg border-border text-muted hover:text-ink'
                }`}
              >
                <Heart size={14} className={liked ? 'fill-rec text-rec' : ''} />
                {liked ? 'Liked!' : 'Add to Favorites'}
              </button>

              <span className="text-xs text-muted">Hover or drag stars to adjust score</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Social Feed Showcase */}
      {activeTab === 'feed' && (
        <div className="space-y-4 animate-in fade-in-0 duration-300">
          <div className="bg-surface-alt p-5 rounded-xl border border-amber/40 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber/20 border border-amber flex items-center justify-center font-bold text-amber text-sm">
                  JD
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink">Jordan_Dev</h4>
                  <span className="text-xs text-muted">reviewed a video • 2h ago</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-bg/80 px-3 py-1 rounded-full border border-amber/30">
                <Star size={14} className="fill-amber text-amber" />
                <span className="text-xs font-bold text-amber">4.8</span>
              </div>
            </div>

            <p className="text-sm text-ink leading-relaxed pl-13">
              "Masterpiece of pacing and visual storytelling. The breakdown of 90s animation techniques in the second act is unbeatable."
            </p>

            <div className="flex items-center gap-4 pt-2 border-t border-border/50 text-xs">
              <button
                onClick={() => {
                  setFeedLiked(!feedLiked)
                  setFeedLikesCount(prev => (feedLiked ? prev - 1 : prev + 1))
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition ${
                  feedLiked
                    ? 'bg-rec/10 border-rec text-rec'
                    : 'bg-bg border-border text-muted hover:text-ink'
                }`}
              >
                <Heart size={14} className={feedLiked ? 'fill-rec text-rec' : ''} />
                <span>{feedLikesCount} Likes</span>
              </button>
              <div className="flex items-center gap-1.5 text-muted">
                <MessageSquare size={14} />
                <span>3 Replies</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive List Builder Showcase */}
      {activeTab === 'list' && (
        <div className="space-y-4 animate-in fade-in-0 duration-300">
          <div className="bg-surface-alt p-5 rounded-xl border border-amber/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-ink flex items-center gap-2">
                  <Film size={18} className="text-amber" />
                  Top Video Essays of 2026
                </h4>
                <span className="text-xs text-muted">{listItems.length} videos in collection</span>
              </div>

              {/* Add item form */}
              <form onSubmit={handleAddListItem} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add video title..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="bg-bg border border-amber/40 text-xs px-3 py-1.5 rounded-lg text-ink outline-none focus:border-amber"
                />
                <button
                  type="submit"
                  className="bg-amber text-bg px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:brightness-110 transition"
                >
                  <Plus size={14} /> Add
                </button>
              </form>
            </div>

            {/* List items */}
            <div className="space-y-2">
              {listItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-bg/80 p-3 rounded-lg border border-border/60 hover:border-amber/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-amber w-4 text-center">{idx + 1}</span>
                    <div>
                      <h5 className="text-xs font-bold text-ink">{item.title}</h5>
                      <span className="text-[10px] text-muted">{item.channel} • {item.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-surface px-2 py-0.5 rounded border border-amber/20">
                    <Star size={12} className="fill-amber text-amber" />
                    <span className="text-xs font-bold text-amber">{item.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
