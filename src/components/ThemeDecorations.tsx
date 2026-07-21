'use client'

import React from 'react'
import { useTheme } from './ThemeProvider'

export function ThemeDecorations() {
  const { activeTheme } = useTheme()
  const Decorations = activeTheme.Decorations

  if (!Decorations) return null

  return <Decorations />
}
