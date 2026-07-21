import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { VideoRow } from '@/components/VideoRow'
import Link from 'next/link'

export const revalidate = 0

export default async function DiaryPage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params
  
  const supabase = await createClient()

  // 1. Fetch Profile
  const { data: prof } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .eq('username', params.username.toLowerCase())
    .single()

  if (!prof) {
    notFound()
  }

  // 2. Fetch Session
  const { data: { session } } = await supabase.auth.getSession()
  const isOwnProfile = session?.user?.id === prof.id

  // 3. Fetch Ratings
  const { data: ratings } = await supabase
    .from('ratings')
    .select('rating, review, note, watch_status, liked, updated_at, videos(id, title, channel, thumbnail_url, url, channels(thumbnail_url))')
    .eq('user_id', prof.id)
    .or('watch_status.is.null,watch_status.neq.want_to_watch')
    .order('updated_at', { ascending: false })

  if (!ratings || ratings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-surface rounded-xl border border-border">
        <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center text-muted">
          <Calendar size={32} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">No diary entries yet</p>
          {isOwnProfile && <p className="text-sm text-muted">Videos you rate or watch will appear here chronologically.</p>}
        </div>
        {isOwnProfile && (
          <Link href="/" className="px-4 py-2 rounded-lg text-sm font-semibold bg-amber text-bg mt-2">
            Log a Video
          </Link>
        )}
      </div>
    )
  }

  // Group by Month/Year
  const grouped: Record<string, any[]> = {}
  ratings.forEach((r: any) => {
    const d = new Date(r.updated_at)
    const monthYear = d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    if (!grouped[monthYear]) grouped[monthYear] = []
    grouped[monthYear].push(r)
  })

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-display font-bold mb-1">{isOwnProfile ? 'My Diary' : `${prof.display_name || prof.username}'s Diary`}</h2>
          <p className="text-sm text-muted">A chronological log of everything watched.</p>
        </div>
      </div>

      {Object.entries(grouped).map(([monthYear, entries]) => (
        <section key={monthYear} className="space-y-4">
          <h2 className="text-lg font-display font-bold text-ink border-b border-border pb-2">{monthYear}</h2>
          <div className="space-y-3">
            {entries.map((r, i) => {
              const v = r.videos || {}
              return (
                <VideoRow
                  key={`${v.id}-${i}`}
                  title={v.title}
                  channel={v.channel}
                  channelThumbnail={v.channels?.thumbnail_url}
                  thumbnail={v.thumbnail_url}
                  url={v.url}
                  detailUrl={`/videos/${v.id}`}
                  rating={r.rating ? Number(r.rating) : null}
                  review={r.review}
                  note={isOwnProfile ? r.note : null}
                  watchStatus={r.watch_status}
                  editUrl={isOwnProfile ? `?logUrl=${encodeURIComponent(v.url)}` : undefined}
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
