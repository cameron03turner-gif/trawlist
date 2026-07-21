export type Video = {
  id: string
  title: string
  channel: string | null
  thumbnail_url: string
  url: string
}

export type LeaderboardEntry = Video & {
  avg_rating: number
  rating_count: number
}
