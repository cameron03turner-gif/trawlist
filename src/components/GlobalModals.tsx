'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { RateModal } from './RateModal'

function GlobalModalsContent() {
  const searchParams = useSearchParams()
  const log = searchParams.get('log') === 'true'
  const logUrl = searchParams.get('logUrl')
  const [closed, setClosed] = useState(false)

  const active = Boolean(log || logUrl)

  useEffect(() => {
    if (active) {
      setClosed(false)
    }
  }, [active, logUrl])

  if (active && !closed) {
    return <RateModal onClose={() => setClosed(true)} />
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
