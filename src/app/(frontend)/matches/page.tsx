import type { Metadata } from 'next'
import Link from 'next/link'

import { MatchCard } from '@/components/MatchCard'
import { Container } from '@/components/ui/Container'
import { getFootballMatches } from '@/lib/football'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Football Matches',
  description: 'Upcoming and recent football matches, fixtures, and results.',
  alternates: { canonical: '/matches' },
}

const PAGE_SIZE = 20

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { docs: matches, totalPages, hasNextPage, hasPrevPage } = await getFootballMatches({
    limit: PAGE_SIZE,
    page,
  })

  return (
    <Container className="py-10">
      <h1 className="mb-8 text-3xl font-extrabold text-ink">Football Matches</h1>

      {matches.length === 0 ? (
        <p className="text-muted">No matches have been added yet. Check back soon.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4 text-sm font-semibold">
          {hasPrevPage ? (
            <Link href={`/matches?page=${page - 1}`} className="text-accent-dark hover:underline">
              Previous
            </Link>
          ) : null}
          <span className="text-muted">
            Page {page} of {totalPages}
          </span>
          {hasNextPage ? (
            <Link href={`/matches?page=${page + 1}`} className="text-accent-dark hover:underline">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </Container>
  )
}
