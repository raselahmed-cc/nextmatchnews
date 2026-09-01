import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export const Badge = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent-dark',
      className,
    )}
  >
    {children}
  </span>
)
