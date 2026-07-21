import React from 'react'

export type Theme = {
  id: string
  name: string
  swatches: [string, string, string] // [bg, surface, accent]
  variables: Record<string, string>
  Decorations: React.FC | null
}
