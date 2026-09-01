import type { ButtonHTMLAttributes, ReactNode } from 'react'

import Link from 'next/link'

import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-dark',
  secondary: 'bg-brand text-white hover:bg-brand-dark',
  ghost: 'bg-transparent text-ink border border-border hover:bg-surface-alt',
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50'

type CommonProps = {
  children: ReactNode
  variant?: Variant
  className?: string
}

type ButtonAsLink = CommonProps & {
  href: string
  external?: boolean
  rel?: string
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

export const Button = (props: ButtonAsLink | ButtonAsButton) => {
  const { children, variant = 'primary', className } = props
  const classes = cn(baseClasses, variantClasses[variant], className)

  if ('href' in props && props.href) {
    const { href, external, rel } = props
    return (
      <Link
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: rel ?? 'noopener noreferrer' } : {})}
      >
        {children}
      </Link>
    )
  }

  const { href: _href, variant: _variant, className: _className, ...buttonProps } =
    props as ButtonAsButton

  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  )
}
