import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MatchCard } from '@/components/MatchCard'
import { MediaImage } from '@/components/MediaImage'
import { TeamCard } from '@/components/TeamCard'
import { Container } from '@/components/ui/Container'
import { getFootballMatches } from '@/lib/football'
import { getWatchGuideHrefForSport } from '@/lib/howToWatch'
import { getNFLGames, NFL_GAMES_SPORT_SLUGS } from '@/lib/nfl'
import { getAllCompetitionSlugs, getCompetitionBySlug, getTeamsByCompetition } from '@/lib/sports'

export const revalidate = 60

export const generateStaticParams = async () => {
  try {
    const slugs = await getAllCompetitionSlugs()
    return slugs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.error('Skipping competition static params — database unavailable at build time:', error)
    return []
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const competition = await getCompetitionBySlug(slug)
  if (!competition) return {}

  return {
    title: competition.name,
    description:
      competition.description || `${competition.name} teams, matches, and news on NextMatchNews.`,
    alternates: { canonical: `/competitions/${competition.slug}` },
  }
}

export default async function CompetitionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const competition = await getCompetitionBySlug(slug)

  if (!competition) notFound()

  // Which event collection to query depends on the competition's sport — see
  // the note in src/lib/football.ts and src/lib/nfl.ts.
  const usesNFLGames = NFL_GAMES_SPORT_SLUGS.has(competition.sport.slug)

  const [teams, matches, watchHref] = await Promise.all([
    getTeamsByCompetition(competition.id),
    usesNFLGames
      ? getNFLGames({ competitionId: competition.id, limit: 6 }).then((result) => result.docs)
      : getFootballMatches({ competitionId: competition.id, limit: 6 }).then((result) => result.docs),
    getWatchGuideHrefForSport(competition.sport.slug),
  ])
  const matchesBasePath = usesNFLGames ? '/nfl/games' : '/matches'

  return (
    <Container className="py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: competition.sport.name, href: `/sports/${competition.sport.slug}` },
          { label: competition.name, href: `/competitions/${competition.slug}` },
        ]}
      />

      <div className="mb-8 flex items-center gap-4">
        {competition.logo && typeof competition.logo === 'object' ? (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface-alt">
            <MediaImage media={competition.logo} priority />
          </div>
        ) : null}
        <div>
          <h1 className="text-3xl font-extrabold text-ink">{competition.name}</h1>
          {competition.country ? <p className="text-muted">{competition.country}</p> : null}
        </div>
      </div>

      {competition.description ? <p className="mb-8 max-w-xl text-muted">{competition.description}</p> : null}

      {matches.length > 0 ? (
        <div className="mb-10">
          <h2 className="mb-4 text-xl font-bold uppercase tracking-wide text-ink">Matches</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} basePath={matchesBasePath} watchHref={watchHref} />
            ))}
          </div>
        </div>
      ) : null}

      <h2 className="mb-4 text-xl font-bold uppercase tracking-wide text-ink">Teams</h2>
      {teams.length === 0 ? (
        <p className="text-muted">No teams added for this competition yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </Container>
  )
}
