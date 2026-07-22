'use client'

import { use } from 'react'
import { ClientModal } from './ClientModal'

export default function InterceptedVideoPageLocal({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <ClientModal id={resolvedParams.id} />
}
