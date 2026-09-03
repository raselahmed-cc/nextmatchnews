'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

const ChevronIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d={direction === 'left' ? 'M12 15l-5-5 5-5' : 'M8 5l5 5-5 5'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// Wraps a horizontally-scrolling row (match ticker, etc.) with the chrome a
// raw `overflow-x-auto` doesn't give you: no visible native scrollbar, a
// soft edge fade hinting there's more, and click-to-scroll arrows for
// pointer users — while staying finger-swipeable on touch. Only the
// scroll-position bookkeeping needs the client; everything it wraps can
// still be server-rendered.
export const HorizontalScroller = ({
  children,
  className,
  fadeClassName = 'from-surface',
}: {
  children: ReactNode
  className?: string
  fadeClassName?: string
}) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateEdges = () => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  useEffect(() => {
    updateEdges()
    const el = trackRef.current
    if (!el) return
    const onResize = () => updateEdges()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [children])

  const scrollByCard = (direction: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8 * (direction === 'left' ? -1 : 1)
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={updateEdges}
        className={cn(
          'flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          className,
        )}
      >
        {children}
      </div>

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r to-transparent transition-opacity sm:w-16',
          fadeClassName,
          canScrollLeft ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l to-transparent transition-opacity sm:w-16',
          fadeClassName,
          canScrollRight ? 'opacity-100' : 'opacity-0',
        )}
      />

      {canScrollLeft ? (
        <button
          type="button"
          onClick={() => scrollByCard('left')}
          aria-label="Scroll left"
          className="absolute left-1 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface p-2 text-ink shadow-md transition-transform hover:scale-105 sm:flex"
        >
          <ChevronIcon direction="left" />
        </button>
      ) : null}
      {canScrollRight ? (
        <button
          type="button"
          onClick={() => scrollByCard('right')}
          aria-label="Scroll right"
          className="absolute right-1 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface p-2 text-ink shadow-md transition-transform hover:scale-105 sm:flex"
        >
          <ChevronIcon direction="right" />
        </button>
      ) : null}
    </div>
  )
}
