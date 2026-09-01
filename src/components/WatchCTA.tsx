import Link from 'next/link'

import type { AffiliateProvider } from '@/payload-types'
import { MediaImage } from './MediaImage'
import { Button } from './ui/Button'

type StreamingOption = {
  provider: AffiliateProvider
  note?: string | null
  id?: string | null
}

/**
 * The site's one "Where to Watch" panel — used on How-to-Watch guide pages,
 * and the component to reuse if match/game/fight pages get their own
 * streaming section later. Every CTA routes through /go/[slug] rather than
 * a raw URL, so the affiliate destination never appears in the page's HTML
 * (see src/app/go/[slug]/route.ts) — and every provider's own `ctaLabel`
 * comes from a `select` field, not free text, so wording like "WATCH FREE"
 * can't slip in here even by accident (CLAUDE.md §26).
 */
export const WatchCTA = ({ options }: { options: StreamingOption[] }) => {
  if (options.length === 0) return null

  return (
    <aside className="rounded-xl border border-border bg-surface-alt/60 p-5 shadow-sm sm:p-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Where to Watch</h2>

      <ul className="mt-4 flex flex-col gap-3">
        {options.map((option) => (
          <li
            key={option.id ?? option.provider.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3 min-w-0">
              {option.provider.logo && typeof option.provider.logo === 'object' ? (
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-alt">
                  <MediaImage media={option.provider.logo} />
                </div>
              ) : null}
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{option.provider.name}</p>
                {option.note || option.provider.description ? (
                  <p className="truncate text-sm text-muted">{option.note || option.provider.description}</p>
                ) : null}
              </div>
            </div>

            <Button
              href={`/go/${option.provider.slug}`}
              external
              rel={option.provider.isAffiliate ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
              className="shrink-0"
            >
              {option.provider.ctaLabel}
            </Button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-muted">
        Some links above are affiliate links.{' '}
        <Link href="/affiliate-disclosure" className="underline hover:text-ink">
          Advertising disclosure
        </Link>
        .
      </p>
    </aside>
  )
}
