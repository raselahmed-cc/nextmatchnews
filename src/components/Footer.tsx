import Link from 'next/link'

import { Container } from './ui/Container'
import { siteConfig } from '@/lib/seo'

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Sports',
    links: [
      { label: 'Football', href: '/football' },
      { label: 'NFL', href: '/nfl' },
      { label: 'Boxing', href: '/boxing' },
      { label: 'Matches', href: '/matches' },
      { label: 'How to Watch', href: '/how-to-watch' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
    ],
  },
]

export const Footer = () => (
  <footer className="mt-16 border-t border-border bg-brand text-white/80">
    <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <p className="text-lg font-extrabold uppercase tracking-tight text-white">
          NextMatch<span className="text-accent">News</span>
        </p>
        <p className="mt-3 max-w-xs text-sm">{siteConfig.description}</p>
      </div>

      {columns.map((column) => (
        <div key={column.title}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-white">{column.title}</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {column.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Container>

    <div className="border-t border-white/10 py-6">
      <Container className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <p>Some links on this site are affiliate links. See our Affiliate Disclosure for details.</p>
      </Container>
    </div>
  </footer>
)
