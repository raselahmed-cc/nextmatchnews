import Link from 'next/link'

import { Container } from './ui/Container'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Football', href: '/football' },
  { label: 'NFL', href: '/nfl' },
  { label: 'NCAA', href: '/ncaa' },
  { label: 'Boxing', href: '/boxing' },
  { label: 'Matches', href: '/matches' },
  { label: 'News', href: '/news' },
  { label: 'How to Watch', href: '/how-to-watch' },
]

export const Header = () => (
  <header className="sticky top-0 z-40 border-b border-border bg-brand text-white">
    <Container className="flex h-16 items-center justify-between gap-4">
      <Link href="/" className="text-lg font-extrabold uppercase tracking-tight">
        NextMatch<span className="text-accent">News</span>
      </Link>

      <nav aria-label="Primary" className="hidden lg:block">
        <ul className="flex items-center gap-6 text-sm font-semibold uppercase tracking-wide">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-accent">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <details className="relative lg:hidden">
        <summary
          aria-label="Open menu"
          className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md border border-white/20 [&::-webkit-details-marker]:hidden"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
            <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </summary>
        <nav
          aria-label="Primary"
          className="absolute right-0 top-11 w-56 rounded-md border border-border bg-brand p-3 shadow-lg"
        >
          <ul className="flex flex-col gap-1 text-sm font-semibold uppercase tracking-wide">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded px-3 py-2 transition-colors hover:bg-white/10 hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </details>
    </Container>
  </header>
)
