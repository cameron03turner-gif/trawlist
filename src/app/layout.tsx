import type { Metadata } from 'next'
import './globals.css'
import { Space_Grotesk, Inter, JetBrains_Mono, Nunito, Plus_Jakarta_Sans } from 'next/font/google'
import { createClient } from '@/lib/supabase/server'
import { NavBar } from '@/components/NavBar'
import { OnboardingGuard } from '@/components/OnboardingGuard'
import { GlobalModals } from '@/components/GlobalModals'
import { ThemeProvider, ThemeScript } from '@/components/ThemeProvider'

import { ThemeDecorations } from '@/components/ThemeDecorations'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--next-font-display',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--next-font-body',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--next-font-mono',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--next-font-nunito',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--next-font-jakarta',
})

export const metadata: Metadata = {
  title: 'Scrubbed — rate what you watch',
  description: 'Log and rate YouTube videos, and see what the community loved.',
}

export default async function RootLayout({ 
  children,
  modal
}: { 
  children: React.ReactNode
  modal: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${nunito.variable} ${plusJakartaSans.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-bg text-ink font-body min-h-screen" suppressHydrationWarning>
        <ThemeProvider>
          <ThemeDecorations />
          <NavBar userEmail={user?.email ?? null} profile={profile} />
          <OnboardingGuard isLoggedIn={!!user} hasUsername={!!profile?.username}>
            <main className="max-w-4xl mx-auto px-4 py-6 relative z-10">{children}</main>
            {modal}
          </OnboardingGuard>
          <GlobalModals />
        </ThemeProvider>
      </body>
    </html>
  )
}
