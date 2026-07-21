import { aero } from './aero'

export const THEMES = [aero]
export type ThemeId = typeof THEMES[number]['id']

export type { Theme } from './types'
