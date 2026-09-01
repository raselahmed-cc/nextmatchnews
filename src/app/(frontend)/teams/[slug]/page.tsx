import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MatchCard } from '@/components/MatchCard'
import { MediaImage } from '@/components/MediaImage'
import { PlayerCard } from '@/components/PlayerCard'
import { Container } from '@/components/ui/Container'
import { getFootballMatches } from '@/lib/football'
import { getNFLGames, NFL_GAMES_SPORT_SLUGS } from '@/lib/nfl'
import { getAllTeamSlugs, getPlayersByTeam, getTeamBySlug } from '@/lib/sports'

export const revalidate = 60

export const generateStaticParams = async () => {
  try {
    const slugs = await getAllTeamSlugs()
    return slugs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.error('Skipping team static params — database unavailable at build time:', error)
    return []
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const team = await getTeamBySlug(slug)
  if (!team) return {}

  return {
    title: team.name,
    description: team.description || `${team.name} squad, matches, and news on NextMatchNews.`,
    alternates: { canonical: `/teams/${team.slug}` },
  }
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const team = await getTeamBySlug(slug)

  if (!team) notFound()

  // Which event collection to query depends on the team's sport — see the note
  // in src/lib/football.ts and src/lib/nfl.ts. Add another branch here when a
  // third team-sport event collection (e.g. basketball) is built.
  const usesNFLGames = NFL_GAMES_SPORT_SLUGS.has(team.sport.slug)

  const [players, matches] = await Promise.all([
    getPlayersByTeam(team.id),
    usesNFLGames
      ? getNFLGames({ teamId: team.id, limit: 6 }).then((result) => result.docs)
      : getFootballMatches({ teamId: team.id, limit: 6 }).then((result) => result.docs),
  ])
  const matchesBasePath = usesNFLGames ? '/nfl/games' : '/matches'

  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: team.name, href: `/teams/${team.slug}` }]} />

      <div className="mb-8 flex items-center gap-4">
        {team.logo && typeof team.logo === 'object' ? (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface-alt">
            <MediaImage media={team.logo} priority />
          </div>
        ) : null}
        <div>
          <h1 className="text-3xl font-extrabold text-ink">{team.name}</h1>
          {team.country ? <p className="text-muted">{team.country}</p> : null}
        </div>
      </div>

      {team.description ? <p className="mb-8 max-w-xl text-muted">{team.description}</p> : null}

      {matches.length > 0 ? (
        <div className="mb-10">
          <h2 className="mb-4 text-xl font-bold uppercase tracking-wide text-ink">Matches</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} basePath={matchesBasePath} />
            ))}
          </div>
        </div>
      ) : null}

      <h2 className="mb-4 text-xl font-bold uppercase tracking-wide text-ink">Squad</h2>
      {players.length === 0 ? (
        <p className="text-muted">No players added for this team yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </Container>
  )
}
