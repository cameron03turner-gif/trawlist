'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CreateListModal } from './CreateListModal'

export function CreateListButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-amber text-bg font-bold rounded-lg hover:brightness-110 transition shadow-sm text-sm"
      >
        <Plus size={16} />
        Create List
      </button>

      {isModalOpen && (
        <CreateListModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  )
}
