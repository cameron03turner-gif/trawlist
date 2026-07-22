import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        border: 'var(--color-border)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        amber: 'var(--color-amber)',
        rec: 'var(--color-rec)',
      },
      borderColor: {
        DEFAULT: 'rgba(32, 208, 192, 0.2)',
      },
      fontFamily: {
        display: ['var(--font-display)', '"Space Grotesk"', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', '"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-zoom': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out forwards',
        'fade-in-zoom': 'fade-in-zoom 0.2s ease-out forwards',
      }
    },
  },
  plugins: [],
}
export default config
