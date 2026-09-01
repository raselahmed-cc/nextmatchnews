import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { Container } from './Container'

export const Section = ({
  children,
  title,
  action,
  className,
}: {
  children: ReactNode
  title?: string
  action?: ReactNode
  className?: string
}) => (
  <section className={cn('py-8 sm:py-12', className)}>
    <Container>
      {title ? (
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-3">
          <h2 className="text-xl font-bold uppercase tracking-wide text-ink sm:text-2xl">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </Container>
  </section>
)
