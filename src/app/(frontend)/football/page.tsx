import type { Metadata } from 'next'
import Link from 'next/link'

import { CompetitionCard } from '@/components/CompetitionCard'
import { MatchCard } from '@/components/MatchCard'
import { Container } from '@/components/ui/Container'
import { getFootballMatches } from '@/lib/football'
import { getCompetitionsBySport, getSportBySlug } from '@/lib/sports'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Football',
  description: 'Football competitions, teams, fixtures, and news.',
  alternates: { canonical: '/football' },
}

export default async function FootballPage() {
  const sport = await getSportBySlug('football')

  if (!sport) {
    return (
      <Container className="flex flex-col items-start gap-3 py-20">
        <h1 className="text-3xl font-extrabold text-ink">Football coverage is being set up</h1>
        <p className="max-w-lg text-muted">
          Once competitions and matches are added in the admin panel, they&apos;ll appear here.
        </p>
        <Link href="/admin" className="font-semibold text-accent-dark hover:underline">
          Go to admin panel
        </Link>
      </Container>
    )
  }

  const [competitions, { docs: upcomingMatches }] = await Promise.all([
    getCompetitionsBySport(sport.id),
    getFootballMatches({ upcomingOnly: true, limit: 6 }),
  ])

  return (
    <Container className="py-10">
      <h1 className="mb-2 text-3xl font-extrabold text-ink">Football</h1>
      {sport.description ? <p className="mb-8 max-w-xl text-muted">{sport.description}</p> : null}

      {upcomingMatches.length > 0 ? (
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-wide text-ink">Upcoming Matches</h2>
            <Link href="/matches" className="text-sm font-semibold text-accent-dark hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
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
