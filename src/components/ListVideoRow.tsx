import { Youtube, MessageSquare, Trash2, GripVertical, Star } from 'lucide-react'
import { BaseVideoCardWrapper } from './BaseVideoCard'

type Props = {
  title: string
  channel: string | null
  channelId?: string | null
  channelThumbnail?: string | null
  thumbnail: string
  url: string
  avgRating?: number | null
  rank?: number
  note?: string | null
  
  // Edit mode props
  isEditing?: boolean
  onNoteChange?: (note: string) => void
  onDelete?: () => void
  
  // Drag and drop props
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
  isDraggedOver?: boolean
}

export function ListVideoRow(props: Props) {
  const leftActionSlot = (
    <>
      {props.isEditing && (
        <div className="flex flex-col items-center justify-center pr-2 sm:pr-4 relative z-10 shrink-0 self-stretch cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 transition-opacity">
          <GripVertical size={24} />
          <div className="text-xs font-mono font-bold text-muted text-center mt-2">
            {props.rank}
          </div>
        </div>
      )}
      {!props.isEditing && props.rank !== undefined && (
        <div className="w-8 text-right text-lg font-display font-bold text-muted flex-shrink-0 pr-3 pt-1 pointer-events-none relative z-10">
          {String(props.rank).padStart(2, '0')}
        </div>
      )}
    </>
  )

  const rightActionSlot = (
    <div className="flex flex-col items-end gap-2 pointer-events-auto ml-auto relative z-10">
      {props.avgRating && (
        <div className="flex items-center gap-1 text-amber bg-amber/10 px-2 py-1 rounded shadow-sm border border-amber/20 mb-auto">
          <Star size={12} fill="currentColor" />
          <span className="text-xs font-bold font-mono">{props.avgRating.toFixed(1)}</span>
        </div>
      )}
      
      {props.isEditing ? (
        <button
          onClick={props.onDelete}
          className="p-2 text-muted hover:text-red-400 bg-bg rounded-lg border border-transparent hover:border-red-400/30 hover:bg-red-400/10 transition-colors shrink-0 shadow-sm mt-auto"
          title="Remove from list"
        >
          <Trash2 size={18} />
        </button>
      ) : (
        <a
          href={props.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-muted hover:text-red-500 bg-bg rounded-lg border border-transparent hover:border-red-500/30 transition-colors shrink-0 shadow-sm mt-auto"
        >
          <Youtube size={18} />
        </a>
      )}
    </div>
  )

  const middleActionSlot = props.isEditing ? (
    <div className="mt-2 pointer-events-auto w-full relative z-10">
      <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">Note</label>
      <textarea
        value={props.note || ''}
        onChange={(e) => props.onNoteChange?.(e.target.value)}
        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber resize-none h-20"
        placeholder="Add a note about this video..."
      />
    </div>
  ) : props.note ? (
    <div className="mt-2 text-sm text-ink leading-relaxed whitespace-pre-wrap bg-surface-alt/50 p-3 rounded-lg/50 shadow-inner pointer-events-auto w-full max-h-32 overflow-y-auto relative z-10">
      <MessageSquare size={14} className="inline mr-2 -mt-0.5 text-muted" />
      <span className="italic">"{props.note}"</span>
    </div>
  ) : null

  return (
    <BaseVideoCardWrapper
      layout="large-row"
      title={props.title}
      channel={props.channel}
      channelId={props.channelId}
      channelThumbnail={props.channelThumbnail}
      thumbnail={props.thumbnail}
      url={props.url}
      draggable={props.draggable}
      onDragStart={props.onDragStart}
      onDragOver={props.onDragOver}
      onDrop={props.onDrop}
      onDragEnd={props.onDragEnd}
      wrapperClassName={`
        ${props.isEditing ? 'border-amber/50 shadow-[0_0_15px_rgba(245,158,11,0.1)] items-stretch' : 'items-stretch'} 
        ${props.isDraggedOver ? 'border-t-4 border-t-amber pt-3' : ''} 
        ${props.draggable ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
      leftActionSlot={leftActionSlot}
      rightActionSlot={rightActionSlot}
      middleActionSlot={middleActionSlot}
    />
  )
}
