export function VideoGridCardSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="w-full aspect-video bg-surface rounded-lg" />
      <div className="px-1 space-y-1.5">
        <div className="h-3 bg-surface rounded w-3/4" />
        <div className="h-2 bg-surface rounded w-1/2" />
        <div className="pt-1 flex items-center justify-between">
          <div className="h-2 bg-surface rounded w-16" />
          <div className="h-3 bg-surface rounded w-6" />
        </div>
      </div>
    </div>
  )
}
