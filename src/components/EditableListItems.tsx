'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ListVideoRow } from './ListVideoRow'
import { Save, X, ChevronUp, ChevronDown } from 'lucide-react'

type Item = {
  position: number
  note: string | null
  video: {
    id: string
    title: string
    channel: string | null
    channel_thumbnail_url?: string | null
    thumbnail_url: string
    url: string
    avg_rating?: number | null
  }
}

type Props = {
  initialItems: Item[]
  listId: string
  isRanked: boolean
  isEditing: boolean
  onCancelEdit: () => void
  onSaveSuccess: () => void
}

export function EditableListItems({ initialItems, listId, isRanked, isEditing, onCancelEdit, onSaveSuccess }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>(initialItems)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null)

  const scrollRaf = useRef<number | null>(null)
  const mouseY = useRef<number>(0)

  // Reset items when edit mode is cancelled or opened
  if (!isEditing && items !== initialItems) {
    setItems(initialItems)
  }

  // Smooth auto-scroll loop
  useEffect(() => {
    if (draggedIndex === null) {
      if (scrollRaf.current) {
        cancelAnimationFrame(scrollRaf.current)
        scrollRaf.current = null
      }
      return
    }

    function scrollLoop() {
      const topScrollThreshold = 180
      const bottomScrollThreshold = 100
      const scrollSpeed = 15
      
      if (mouseY.current > 0) {
        if (mouseY.current < topScrollThreshold) {
          window.scrollBy(0, -scrollSpeed)
        } else if (window.innerHeight - mouseY.current < bottomScrollThreshold) {
          window.scrollBy(0, scrollSpeed)
        }
      }

      scrollRaf.current = requestAnimationFrame(scrollLoop)
    }
    
    scrollRaf.current = requestAnimationFrame(scrollLoop)
    
    return () => {
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current)
    }
  }, [draggedIndex])

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // Required for Firefox
    e.dataTransfer.setData('text/plain', index.toString())
    // Subtle offset for drag image could be added here
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault() // Required to allow drop
    e.dataTransfer.dropEffect = 'move'
    mouseY.current = e.clientY

    if (draggedIndex === null || draggedIndex === index) return
    setDraggedOverIndex(index)
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newItems = [...items]
      const [draggedItem] = newItems.splice(draggedIndex, 1)
      newItems.splice(dropIndex, 0, draggedItem)
      
      // Update positions
      newItems.forEach((item, i) => {
        item.position = i + 1
      })
      
      setItems(newItems)
    }
    setDraggedIndex(null)
    setDraggedOverIndex(null)
    mouseY.current = 0
  }

  function handleDragEnd() {
    setDraggedIndex(null)
    setDraggedOverIndex(null)
    mouseY.current = 0
  }

  function deleteItem(index: number) {
    const newItems = items.filter((_, i) => i !== index)
    // Update positions
    newItems.forEach((item, i) => {
      item.position = i + 1
    })
    setItems(newItems)
  }

  function updateNote(index: number, note: string) {
    const newItems = [...items]
    newItems[index].note = note
    setItems(newItems)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    
    try {
      // 1. Reorder items
      const orderPayload = items.map(i => ({
        video_id: i.video.id,
        position: i.position
      }))
      
      const resOrder = await fetch(`/api/lists/${listId}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', items: orderPayload })
      })

      if (!resOrder.ok) throw new Error('Failed to update ordering')

      // 2. Find deleted items and remove them
      const originalIds = new Set(initialItems.map(i => i.video.id))
      const currentIds = new Set(items.map(i => i.video.id))
      const deletedIds = Array.from(originalIds).filter(id => !currentIds.has(id))
      
      for (const id of deletedIds) {
        await fetch(`/api/lists/${listId}/items?videoId=${id}`, {
          method: 'DELETE'
        })
      }

      // 3. Update notes if they changed
      for (const item of items) {
        const originalItem = initialItems.find(i => i.video.id === item.video.id)
        if (originalItem && originalItem.note !== item.note) {
          await fetch(`/api/lists/${listId}/items`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_note', video_id: item.video.id, note: item.note })
          })
        }
      }

      router.refresh()
      onSaveSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isEditing && (!items || items.length === 0)) {
    return (
      <div className="text-center py-20 bg-neutral-900/30 rounded-xl border border-neutral-800/50 mb-20">
        <p className="text-neutral-500 text-lg">This list is currently empty.</p>
      </div>
    )
  }

  return (
    <>
      {draggedIndex !== null && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col justify-between items-center py-8">
          <div className="bg-surface/90 backdrop-blur-md border border-amber shadow-[0_0_20px_rgba(245,158,11,0.2)] text-amber p-3 rounded-full animate-bounce mt-24">
            <ChevronUp size={28} />
          </div>
          <div className="bg-surface/90 backdrop-blur-md border border-amber shadow-[0_0_20px_rgba(245,158,11,0.2)] text-amber p-3 rounded-full animate-bounce mb-8">
            <ChevronDown size={28} />
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-4 mb-32 relative">
        {isEditing && (
          <div 
            className="sticky top-4 z-50 bg-surface/90 backdrop-blur-md  shadow-lg p-4 rounded-xl mb-6 flex items-center justify-between"
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              mouseY.current = e.clientY
            }}
          >
            <div>
              <h3 className="font-bold text-ink">Editing List</h3>
              <p className="text-xs text-muted">Drag to reorder. Changes apply when you save.</p>
            </div>
            <div className="flex items-center gap-3">
              {error && <span className="text-red-400 text-sm">{error}</span>}
              <button
                onClick={onCancelEdit}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-ink hover:bg-surface-alt rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm bg-amber text-bg font-bold rounded-lg hover:brightness-110 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {items.map((item, index) => (
          <div key={item.video.id} className={`${draggedIndex === index ? 'opacity-50' : ''}`}>
            <ListVideoRow
              title={item.video.title}
              channel={item.video.channel}
              channelThumbnail={item.video.channel_thumbnail_url}
              thumbnail={item.video.thumbnail_url}
              url={item.video.url}
              avgRating={item.video.avg_rating}
              rank={isRanked ? item.position : undefined}
              note={item.note}
              
              isEditing={isEditing}
              draggable={isEditing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              isDraggedOver={draggedOverIndex === index}
              onDelete={() => deleteItem(index)}
              onNoteChange={(newNote) => updateNote(index, newNote)}
            />
          </div>
        ))}
        
        {isEditing && items.length === 0 && (
          <div className="text-center py-10 bg-surface-alt/30 rounded-xl">
            <p className="text-muted">All items removed. Click save to confirm.</p>
          </div>
        )}
      </div>
    </>
  )
}

