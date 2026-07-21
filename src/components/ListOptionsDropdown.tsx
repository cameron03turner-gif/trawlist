'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Settings, Edit2 } from 'lucide-react'
import { ListSettingsModal } from './ListSettingsModal'

type Props = {
  list: any
  onEditItemsClick: () => void
}

export function ListOptionsDropdown({ list, onEditItemsClick }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 text-muted hover:text-ink bg-surface hover:border-border/80 rounded-lg transition-colors shadow-sm"
          title="List Options"
        >
          <MoreHorizontal size={18} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-xl shadow-xl overflow-hidden z-50">
            <button
              onClick={() => {
                setIsOpen(false)
                setShowSettings(true)
              }}
              className="w-full px-4 py-3 text-sm text-left font-medium text-ink hover:bg-surface-alt hover:text-amber transition-colors flex items-center gap-3/50"
            >
              <Settings size={16} /> List Settings
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                onEditItemsClick()
              }}
              className="w-full px-4 py-3 text-sm text-left font-medium text-ink hover:bg-surface-alt hover:text-amber transition-colors flex items-center gap-3"
            >
              <Edit2 size={16} /> Edit Entries
            </button>
          </div>
        )}
      </div>

      {showSettings && (
        <ListSettingsModal 
          list={list} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </>
  )
}
