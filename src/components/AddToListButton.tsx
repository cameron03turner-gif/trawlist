'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AddToListModal } from './AddToListModal'

export function AddToListButton({ listId }: { listId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-amber text-bg font-bold rounded-lg hover:brightness-110 transition shadow-sm text-sm"
      >
        <Plus size={16} />
        Add Video
      </button>

      {isModalOpen && (
        <AddToListModal listId={listId} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  )
}
