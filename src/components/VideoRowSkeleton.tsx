export function VideoRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface animate-pulse">
      {/* Rank placeholder (optional, width 7 roughly matches 28px) */}
      <div className="w-7 hidden md:block" />
      
      {/* Thumbnail placeholder */}
      <div className="w-24 h-[54px] bg-border rounded-md flex-shrink-0" />
      
      {/* Info placeholder */}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 bg-border rounded w-3/4" />
        <div className="h-3 bg-border rounded w-1/2" />
        <div className="h-3.5 bg-border rounded w-1/3 mt-2" />
      </div>
      
      {/* Score placeholder */}
      <div className="w-10 h-6 bg-border rounded flex-shrink-0" />
      
      {/* Actions placeholder */}
      <div className="w-8 h-8 bg-border rounded-md flex-shrink-0" />
    </div>
  )
}
