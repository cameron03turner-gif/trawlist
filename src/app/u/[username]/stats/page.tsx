import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BarChart, Calendar, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StatsPage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params
  
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .eq('username', params.username)
    .single()

  if (!profile) {
    return notFound()
  }

  // Fetch all user ratings
  const { data: ratings } = await supabase
    .from('ratings')
    .select(`
      rating,
      updated_at,
      videos ( channel, channel_id )
    `)
    .eq('user_id', profile.id)
    .not('rating', 'is', null)

  const ratedItems = ratings || []

  // 1. Rating Distribution (Half stars)
  const starLevels = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]
  const distribution = starLevels.map(star => {
    return {
      star,
      count: ratedItems.filter(r => Number(r.rating) === star).length
    }
  })
  const maxCount = Math.max(...distribution.map(d => d.count), 1)

  // 2. Top Channels
  const channelCounts: Record<string, { name: string, count: number }> = {}
  let totalRatingSum = 0
  ratedItems.forEach((r: any) => {
    totalRatingSum += Number(r.rating)
    const cName = r.videos?.channel || 'Unknown'
    if (!channelCounts[cName]) {
      channelCounts[cName] = { name: cName, count: 0 }
    }
    channelCounts[cName].count++
  })

  const topChannels = Object.values(channelCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const topChannel = topChannels.length > 0 ? topChannels[0].name : 'None'
  const overallAvgRating = ratedItems.length > 0 ? (totalRatingSum / ratedItems.length).toFixed(2) : '--'

  // 3. Heatmap Activity
  const activityMap: Record<string, number> = {}
  ratedItems.forEach(r => {
    const dateStr = new Date(r.updated_at).toISOString().split('T')[0]
    activityMap[dateStr] = (activityMap[dateStr] || 0) + 1
  })

  const today = new Date()
  const days: { dateStr: string, count: number }[] = []
  for (let i = 84; i >= 0; i--) { // Last 12 weeks (84 days) for a clean grid
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      dateStr,
      count: activityMap[dateStr] || 0
    })
  }

  const name = profile.display_name || profile.username

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink mb-2">{name}&apos;s Stats</h2>
        <p className="text-muted">A breakdown of your viewing habits and ratings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <section className="bg-surface rounded-xl p-6 border border-amber shadow-sm hover:scale-[1.02] hover:shadow-xl hover:shadow-amber/10 transition-all duration-300">
          <div className="flex items-center gap-2 mb-8 text-ink">
            <BarChart size={20} className="text-amber" />
            <h3 className="text-lg font-bold">Rating Distribution</h3>
          </div>
          
          <div className="flex items-end gap-1.5 h-48 w-full justify-between pt-6">
            {distribution.map(d => (
              <div key={d.star} className="flex-1 flex flex-col items-center gap-2 h-full">
                <div className="w-full bg-surface-alt rounded-sm relative flex items-end justify-center group h-full" title={`${d.count} rating${d.count === 1 ? '' : 's'}`}>
                  {d.count > 0 && (
                    <div className="absolute -top-6 text-xs font-bold text-amber">
                      {d.count}
                    </div>
                  )}
                  <div 
                    className="w-full bg-amber rounded-sm transition-all group-hover:brightness-110"
                    style={{ height: d.count > 0 ? `${(d.count / maxCount) * 100}%` : '0%' }}
                  />
                </div>
                <div className="text-[10px] font-bold text-muted mt-1">{d.star}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6 flex flex-col">
          {/* Top Channels */}
          <section className="bg-surface rounded-xl p-6 border border-amber shadow-sm flex-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber/10 transition-all duration-300">
            <div className="flex items-center gap-2 mb-6 text-ink">
              <Trophy size={20} className="text-amber" />
              <h3 className="text-lg font-bold">Most Watched Channels</h3>
            </div>
            
            <div className="space-y-4">
              {topChannels.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">No channels rated yet.</p>
              ) : (
                topChannels.map((c, idx) => (
                  <div key={c.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-bold text-muted w-4">{idx + 1}.</span>
                      <span className="text-sm font-medium text-ink truncate group-hover:text-amber transition-colors">{c.name}</span>
                    </div>
                    <span className="text-sm text-muted font-mono bg-surface-alt px-2 py-0.5 rounded">{c.count}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <section className="bg-surface rounded-xl p-6 border border-amber shadow-sm hover:scale-[1.02] hover:shadow-xl hover:shadow-amber/10 transition-all duration-300">
        <div className="flex items-center gap-2 mb-6 text-ink">
          <Calendar size={20} className="text-amber" />
          <h3 className="text-lg font-bold">Activity (Last 12 Weeks)</h3>
        </div>
        
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1 min-w-max">
            {/* Split into weeks (chunks of 7) */}
            {Array.from({ length: 12 }).map((_, weekIdx) => {
              const weekDays = days.slice(weekIdx * 7, (weekIdx + 1) * 7)
              return (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {weekDays.map(d => (
                    <div 
                      key={d.dateStr}
                      title={`${d.count} ratings on ${d.dateStr}`}
                      className={`w-4 h-4 rounded-sm transition-colors ${
                        d.count === 0 ? 'bg-surface-alt border border-amber/50' : 
                        d.count === 1 ? 'bg-amber/30 border border-amber/10' :
                        d.count <= 3 ? 'bg-amber/60 border border-amber/20' :
                        'bg-amber border border-amber/30'
                      }`}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
