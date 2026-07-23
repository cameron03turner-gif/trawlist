'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { ReportModal } from './ReportModal'

export function ProfileReportButton({
  profileId,
  username,
}: {
  profileId: string
  username: string
}) {
  const [isReportOpen, setIsReportOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsReportOpen(true)}
        className="w-8 h-8 rounded-full bg-surface-alt border border-amber/30 text-muted hover:text-amber hover:border-amber hover:bg-surface-alt/90 transition-all shrink-0 flex items-center justify-center shadow-sm"
        title="Report Profile"
      >
        <Flag size={13} />
      </button>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="profile"
        targetId={profileId}
        targetTitle={`User Profile @${username}`}
      />
    </>
  )
}
