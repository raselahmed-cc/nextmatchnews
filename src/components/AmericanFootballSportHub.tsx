import Link from 'next/link'

import { getNFLGamesForSport } from '@/lib/nfl'
import { getCompetitionsBySport, getSportBySlug } from '@/lib/sports'
import { CompetitionCard } from './CompetitionCard'
import { MatchCard } from './MatchCard'
import { Container } from './ui/Container'

// Shared hub-page shape for any sport that lives in the `nfl-games`
// collection (currently NFL and NCAA Football — same game shape, different
// competition tiers). Not a generic "any sport" hub: Football (soccer) has
// its own collection/lib and its own page, since the two aren't
// interchangeable — see src/lib/football.ts vs src/lib/nfl.ts.
export const AmericanFootballSportHub = async ({
  sportSlug,
  title,
  gamesIndexHref,
  gamesBasePath,
}: {
  sportSlug: string
  title: string
  gamesIndexHref: string
  gamesBasePath: string
}) => {
  const sport = await getSportBySlug(sportSlug)

  if (!sport) {
    return (
      <Container className="flex flex-col items-start gap-3 py-20">
        <h1 className="text-3xl font-extrabold text-ink">{title} coverage is being set up</h1>
        <p className="max-w-lg text-muted">
          Once competitions and games are added in the admin panel, they&apos;ll appear here.
        </p>
        <Link href="/admin" className="font-semibold text-accent-dark hover:underline">
          Go to admin panel
        </Link>
      </Container>
    )
  }

  const [competitions, { docs: upcomingGames }] = await Promise.all([
    getCompetitionsBySport(sport.id),
    getNFLGamesForSport(sportSlug, { upcomingOnly: true, limit: 6 }),
  ])

  return (
    <Container className="py-10">
      <h1 className="mb-2 text-3xl font-extrabold text-ink">{title}</h1>
      {sport.description ? <p className="mb-8 max-w-xl text-muted">{sport.description}</p> : null}

      {upcomingGames.length > 0 ? (
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-wide text-ink">Upcoming Games</h2>
            <Link href={gamesIndexHref} className="text-sm font-semibold text-accent-dark hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingGames.map((game) => (
              <MatchCard key={game.id} match={game} basePath={gamesBasePath} />
            ))}
          </div>
        </div>
      ) : null}

      <h2 className="mb-4 text-xl font-bold uppercase tracking-wide text-ink">Competitions</h2>
      {competitions.length === 0 ? (
        <p className="text-muted">No competitions added yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {competitions.map((competition) => (
            <CompetitionCard key={competition.id} competition={competition} />
          ))}
        </div>
      )}
    </Container>
  )
}
