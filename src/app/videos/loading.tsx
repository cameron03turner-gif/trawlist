import { VideoRowSkeleton } from '@/components/VideoRowSkeleton'

export default function Loading() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-8 bg-surface rounded w-48 mb-1 animate-pulse" />
        <div className="h-4 bg-surface rounded w-72 animate-pulse" />
      </div>
      
      <div className="h-[46px] bg-surface rounded-lg mb-6 animate-pulse" />

      <div className="space-y-2">
        <VideoRowSkeleton />
        <VideoRowSkeleton />
        <VideoRowSkeleton />
        <VideoRowSkeleton />
        <VideoRowSkeleton />
      </div>
    </div>
  )
}
