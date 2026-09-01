import Link from 'next/link'

import { getNFLGamesForSport } from '@/lib/nfl'
import { Container } from './ui/Container'
import { MatchCard } from './MatchCard'

const PAGE_SIZE = 20

// See the note in AmericanFootballSportHub.tsx — shared between NFL and NCAA
// Football's schedule index pages only, not a generic "any sport" component.
export const AmericanFootballGamesIndex = async ({
  sportSlug,
  title,
  basePath,
  page,
}: {
  sportSlug: string
  title: string
  basePath: string
  page: number
}) => {
  const { docs: games, totalPages, hasNextPage, hasPrevPage } = await getNFLGamesForSport(sportSlug, {
    limit: PAGE_SIZE,
    page,
  })

  return (
    <Container className="py-10">
      <h1 className="mb-8 text-3xl font-extrabold text-ink">{title}</h1>

      {games.length === 0 ? (
        <p className="text-muted">No games have been added yet. Check back soon.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <MatchCard key={game.id} match={game} basePath={basePath} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4 text-sm font-semibold">
          {hasPrevPage ? (
            <Link href={`${basePath}?page=${page - 1}`} className="text-accent-dark hover:underline">
              Previous
            </Link>
          ) : null}
          <span className="text-muted">
            Page {page} of {totalPages}
          </span>
          {hasNextPage ? (
            <Link href={`${basePath}?page=${page + 1}`} className="text-accent-dark hover:underline">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </Container>
  )
}
