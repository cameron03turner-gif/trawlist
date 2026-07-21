'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { THEMES, Theme, ThemeId } from '../themes'

type ThemeContextType = {
  activeTheme: Theme
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>('aero')

  useEffect(() => {
    const saved = localStorage.getItem('scrubbed-theme') as ThemeId
    if (saved && THEMES.find((t) => t.id === saved)) {
      setActiveThemeId(saved)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeThemeId)
  }, [activeThemeId])

  const activeTheme = THEMES.find((t) => t.id === activeThemeId) || THEMES[0]

  const handleSetTheme = (id: ThemeId) => {
    setActiveThemeId(id)
    localStorage.setItem('scrubbed-theme', id)
  }

  // Create the CSS string for the variables
  const cssString = Object.entries(activeTheme.variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n')

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme: handleSetTheme }}>
      <style dangerouslySetInnerHTML={{ __html: `:root { \n${cssString}\n }` }} />
      {children}
    </ThemeContext.Provider>
  )
}

// Anti-flash script to inject before paint
export const ThemeScript = () => {
  const code = `
    try {
      var saved = localStorage.getItem('scrubbed-theme');
      if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        document.documentElement.setAttribute('data-theme', 'aero');
      }
    } catch (e) {}
  `
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}
