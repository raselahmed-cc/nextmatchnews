import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export const Prose = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div
    className={cn(
      'prose prose-slate max-w-none prose-headings:font-bold prose-a:text-accent-dark prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg',
      className,
    )}
  >
    {children}
  </div>
)
