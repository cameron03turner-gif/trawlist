'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export function OnboardingGuard({
  hasUsername,
  isLoggedIn,
  children,
}: {
  hasUsername: boolean
  isLoggedIn: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const isBypassRoute = pathname === '/welcome' || pathname === '/login' || pathname.startsWith('/auth')

  useEffect(() => {
    if (isLoggedIn && !hasUsername && !isBypassRoute) {
      router.replace('/welcome')
    }
  }, [isLoggedIn, hasUsername, isBypassRoute, router])

  // Prevent flash of content while redirecting
  if (isLoggedIn && !hasUsername && !isBypassRoute) {
    return null
  }

  return <>{children}</>
}
