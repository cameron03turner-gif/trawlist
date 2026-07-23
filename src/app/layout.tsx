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
  metadataBase: new URL('https://www.trawlist.com'),
  title: {
    default: 'Trawlist — Log, rate, and discover YouTube videos',
    template: '%s | Trawlist',
  },
  description: 'Trawlist is a social network for video enthusiasts. Track what you watch, write reviews, curate custom playlists, and discover great content.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/logo.png' },
    ],
  },
  openGraph: {
    title: 'Trawlist — Log, rate, and discover YouTube videos',
    description: 'Trawlist is a social network for video enthusiasts. Track what you watch, write reviews, curate custom playlists, and discover great content.',
    url: 'https://www.trawlist.com',
    siteName: 'Trawlist',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Trawlist Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Trawlist — Log, rate, and discover YouTube videos',
    description: 'Trawlist is a social network for video enthusiasts. Track what you watch, write reviews, curate custom playlists, and discover great content.',
    images: ['/logo.png'],
  },
}

import Link from 'next/link'

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
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="bg-bg text-ink font-body min-h-screen flex flex-col justify-between" suppressHydrationWarning>
        <ThemeProvider>
          <ThemeDecorations />
          <NavBar userEmail={user?.email ?? null} profile={profile} />
          <OnboardingGuard isLoggedIn={!!user} hasUsername={!!profile?.username}>
            <main className="max-w-4xl mx-auto px-4 py-6 relative z-10 w-full flex-1">{children}</main>
            {modal}
          </OnboardingGuard>
          <footer className="w-full max-w-4xl mx-auto px-4 py-8 border-t border-amber/10 text-center text-xs text-muted flex items-center justify-center gap-4 flex-wrap relative z-10">
            <span>© {new Date().getFullYear()} Trawlist</span>
            <span>•</span>
            <Link href="/guidelines" className="hover:text-amber transition-colors">Community Guidelines</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-amber transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-amber transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/bug-report" className="hover:text-amber transition-colors">Bug Report</Link>
          </footer>
          <GlobalModals />
        </ThemeProvider>
      </body>
    </html>
  )
}
