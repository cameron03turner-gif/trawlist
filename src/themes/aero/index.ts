import { Theme } from '../types'
import { AeroDecorations } from './Decorations'

export const aero: Theme = {
  id: 'aero',
  name: 'Frutiger Aero',
  swatches: ['#060E10', 'rgba(255, 255, 255, 0.08)', '#20D0C0'],
  variables: {
    '--color-bg': '#060E10',
    '--color-surface': 'rgba(255, 255, 255, 0.08)',
    '--color-surface-alt': 'rgba(255, 255, 255, 0.12)',
    '--color-border': 'rgba(255, 255, 255, 0.15)',
    '--color-ink': '#E2F0F2',
    '--color-muted': '#8CB5C0',
    '--color-amber': '#20D0C0', // More turquoise
    '--color-rec': '#E04A2A',
    '--font-display': 'var(--next-font-nunito), "Nunito", "Trebuchet MS", sans-serif',
    '--font-body': 'var(--next-font-jakarta), "Plus Jakarta Sans", "Segoe UI", sans-serif',
    '--modal-backdrop-bg': 'rgba(0, 5, 10, 0.85)',
    '--modal-backdrop-blur': '12px',
    '--scrollbar-width': '12px',
    '--scrollbar-track-bg': 'rgba(0, 10, 15, 0.40)',
    '--scrollbar-track-radius': '6px',
    '--scrollbar-track-shadow': 'inset 0 0 6px rgba(0, 0, 0, 0.50)',
    '--scrollbar-thumb-bg': 'linear-gradient(180deg, #38C8D8 0%, #20D0C0 50%, #12A89A 100%)',
    '--scrollbar-thumb-radius': '6px',
    '--scrollbar-thumb-border': '2px solid rgba(6, 14, 16, 0.80)',
    '--scrollbar-thumb-shadow': 'inset 0 1px 2px rgba(255, 255, 255, 0.50), inset 0 -1px 2px rgba(0, 0, 0, 0.30)',
    '--scrollbar-thumb-hover': 'linear-gradient(180deg, #4EE2F0 0%, #26D4C4 50%, #18B8A8 100%)',
  },
  Decorations: AeroDecorations,
}
