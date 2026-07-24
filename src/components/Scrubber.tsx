'use client'

import { useRef, useState, useEffect } from 'react'
import { Star } from 'lucide-react'

export function Scrubber({
  value,
  onChange,
  interactive = true,
  height = 20, // default size for stars
}: {
  value: number | null
  onChange?: (v: number | null) => void
  interactive?: boolean
  height?: number
}) {
  const [isMounted, setIsMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  function computeFromEvent(e: React.MouseEvent, rect: DOMRect) {
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width)
    const raw = Math.round(((x / rect.width) * 5) * 2) / 2
    return Math.min(5, Math.max(0, raw))
  }

  function handlePointerMove(e: React.MouseEvent) {
    if (!interactive || !ref.current) return
    setHoverValue(computeFromEvent(e, ref.current.getBoundingClientRect()))
  }

  function handlePointerLeave() {
    if (!interactive) return
    setHoverValue(null)
  }

  function handleClick(e: React.MouseEvent) {
    if (!interactive || !ref.current || !onChange) return
    onChange(computeFromEvent(e, ref.current.getBoundingClientRect()))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!interactive || !onChange) return
    const current = value || 0
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(Math.min(5, Math.round((current + 0.5) * 2) / 2))
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(Math.max(0, Math.round((current - 0.5) * 2) / 2))
    }
  }

  const numVal = value != null && !isNaN(Number(value)) ? Number(value) : null
  const displayValue = hoverValue !== null ? hoverValue : (numVal !== null ? Math.max(0, Math.min(5, numVal)) : 0)

  return (
    <div
      ref={ref}
      onClick={handleClick}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      tabIndex={interactive ? 0 : -1}
      role={interactive ? 'slider' : undefined}
      aria-valuemin={0}
      aria-valuemax={5}
      aria-valuenow={numVal ?? 0}
      aria-label="Rating out of 5"
      className={`relative inline-flex items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-amber rounded ${interactive ? 'cursor-pointer' : ''}`}
    >
      <div className="aero-scrubber-stars flex gap-1">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillAmount = Math.max(0, Math.min(1, displayValue - (starIndex - 1)))
          
          return (
            <div key={starIndex} className="relative flex-shrink-0" style={{ width: height, height }}>
              <Star 
                size={height} 
                className="text-border absolute inset-0" 
                strokeWidth={1.5}
              />
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillAmount * 100}%` }}
              >
                <Star 
                  size={height} 
                  className="text-amber absolute top-0 left-0" 
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
