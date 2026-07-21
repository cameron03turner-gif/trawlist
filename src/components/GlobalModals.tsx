'use client'

import { useSearchParams } from 'next/navigation'
import { RateModal } from './RateModal'
import { Suspense } from 'react'

function GlobalModalsContent() {
  const searchParams = useSearchParams()
  const log = searchParams.get('log') === 'true'
  const logUrl = searchParams.get('logUrl')

  if (log || logUrl) {
    return <RateModal />
  }

  return null
}

export function GlobalModals() {
  return (
    <Suspense fallback={null}>
      <GlobalModalsContent />
    </Suspense>
  )
}
