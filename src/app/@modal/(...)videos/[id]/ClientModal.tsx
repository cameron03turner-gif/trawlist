'use client'

import { VideoDetailModal } from '@/components/VideoDetailModal'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function ClientModal({ id }: { id: string }) {
  const router = useRouter()
  
  const handleClose = useCallback(() => {
    try {
      router.back()
    } catch {
      // Fallback in case router.back() fails with initialTree error
      router.push('/')
    }
  }, [router])

  return <VideoDetailModal videoId={id} onClose={handleClose} />
}
