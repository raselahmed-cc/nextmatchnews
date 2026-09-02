import type { Metadata } from 'next'
import Link from 'next/link'

import { MatchCard } from '@/components/MatchCard'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/cn'
import { getFootballMatches } from '@/lib/football'
import { getWatchGuideHrefForSport } from '@/lib/howToWatch'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Football Fixtures & Results',
  description: 'Upcoming Premier League fixtures and recent match results.',
  alternates: { canonical: '/matches' },
}

const PAGE_SIZE = 20

type Tab = 'fixtures' | 'results'

const TABS: { value: Tab; label: string }[] = [
  { value: 'fixtures', label: 'Upcoming Fixtures' },
  { value: 'results', label: 'Results' },
]

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tab?: string }>
}) {
  const { page: pageParam, tab: tabParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  // Previously this page just listed every football match ever synced,
  // sorted newest-kickoff-first — with 380 historical results and a handful
  // of future fixtures in the same collection, that silently interleaved
  // finished matches from 2025 with scheduled ones from 2026 in one
  // undifferentiated list. Splitting into two clearly-labeled, correctly
  // sorted tabs is what actually makes it a usable fixtures/results page.
  const tab: Tab = tabParam === 'results' ? 'results' : 'fixtures'

  const [{ docs: matches, totalPages, hasNextPage, hasPrevPage }, watchHref] = await Promise.all([
    tab === 'results'
      ? getFootballMatches({ status: 'finished', limit: PAGE_SIZE, page })
      : getFootballMatches({ upcomingOnly: true, limit: PAGE_SIZE, page }),
    getWatchGuideHrefForSport('football'),
  ])

  return (
    <Container className="py-10">
      <h1 className="mb-2 text-3xl font-extrabold text-ink">Football Fixtures &amp; Results</h1>
      <p className="mb-8 max-w-xl text-muted">
        Premier League schedule, upcoming fixtures, and recent match results.
      </p>

      <div className="mb-6 flex gap-6 border-b border-border">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value === 'fixtures' ? '/matches' : '/matches?tab=results'}
            className={cn(
              'border-b-2 pb-3 text-sm font-semibold uppercase tracking-wide transition-colors',
              tab === t.value ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {matches.length === 0 ? (
        <p className="text-muted">
          {tab === 'fixtures' ? 'No upcoming fixtures scheduled yet.' : 'No results yet. Check back soon.'}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} watchHref={watchHref} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4 text-sm font-semibold">
          {hasPrevPage ? (
            <Link href={`/matches?tab=${tab}&page=${page - 1}`} className="text-accent-dark hover:underline">
              Previous
            </Link>
          ) : null}
          <span className="text-muted">
            Page {page} of {totalPages}
          </span>
          {hasNextPage ? (
            <Link href={`/matches?tab=${tab}&page=${page + 1}`} className="text-accent-dark hover:underline">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </Container>
  )
}
