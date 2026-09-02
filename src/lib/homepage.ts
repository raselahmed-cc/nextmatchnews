import type { Media } from '@/payload-types'
import { getFights } from '@/lib/boxing'
import { getFootballMatches } from '@/lib/football'
import { getNFLGames, type PopulatedNFLGame } from '@/lib/nfl'
import type { PopulatedFight } from '@/lib/boxing'
import type { PopulatedFootballMatch } from '@/lib/football'

// Unifies football/NFL/NCAA (team vs team) and boxing (fighter vs fighter)
// into one shape so a single card component and homepage section can render
// all four sports. Only these four are included — rugby/basketball/F1 have
// no synced data and no detail pages yet, so there's nowhere to link them.
export type HomeFixture = {
  id: string
  sportLabel: string
  competitionName: string
  slug: string
  basePath: string
  kickoff: string
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
  participantA: { name: string; media: Media | null }
  participantB: { name: string; media: Media | null }
  scoreA?: number | null
  scoreB?: number | null
  resultNote?: string | null
}

const asMedia = (value: number | Media | null | undefined): Media | null =>
  value && typeof value === 'object' ? value : null

const fromFootballMatch = (match: PopulatedFootballMatch): HomeFixture => ({
  id: `football-${match.id}`,
  sportLabel: 'Football',
  competitionName: match.competition.name,
  slug: match.slug,
  basePath: '/matches',
  kickoff: match.kickoffTime,
  status: match.status,
  participantA: { name: match.homeTeam.name, media: asMedia(match.homeTeam.logo) },
  participantB: { name: match.awayTeam.name, media: asMedia(match.awayTeam.logo) },
  scoreA: match.homeScore,
  scoreB: match.awayScore,
})

const fromNFLGame = (game: PopulatedNFLGame): HomeFixture => {
  const isNCAA = game.competition.sport.slug === 'ncaa-football'
  return {
    id: `nfl-${game.id}`,
    sportLabel: isNCAA ? 'NCAA Football' : 'NFL',
    competitionName: game.competition.name,
    slug: game.slug,
    basePath: isNCAA ? '/ncaa/games' : '/nfl/games',
    kickoff: game.kickoffTime,
    status: game.status,
    participantA: { name: game.homeTeam.name, media: asMedia(game.homeTeam.logo) },
    participantB: { name: game.awayTeam.name, media: asMedia(game.awayTeam.logo) },
    scoreA: game.homeScore,
    scoreB: game.awayScore,
  }
}

const methodLabel: Record<string, string> = {
  ko: 'KO',
  tko: 'TKO',
  'decision-unanimous': 'Unanimous Decision',
  'decision-split': 'Split Decision',
  'decision-majority': 'Majority Decision',
  submission: 'Submission',
  draw: 'Draw',
  'no-contest': 'No Contest',
  disqualification: 'Disqualification',
}

const fromFight = (fight: PopulatedFight): HomeFixture => {
  const winnerId = fight.winner?.id
  return {
    id: `fight-${fight.id}`,
    sportLabel: 'Boxing',
    competitionName: fight.weightClass || fight.event.name,
    slug: fight.slug,
    basePath: '/boxing/fights',
    kickoff: fight.event.date,
    status: fight.status,
    participantA: { name: fight.fighterA.name, media: asMedia(fight.fighterA.photo) },
    participantB: { name: fight.fighterB.name, media: asMedia(fight.fighterB.photo) },
    resultNote:
      fight.status === 'finished'
        ? [fight.method ? methodLabel[fight.method] || fight.method : null, winnerId ? `${winnerId === fight.fighterA.id ? fight.fighterA.name : fight.fighterB.name} wins` : null]
            .filter(Boolean)
            .join(' · ') || null
        : null,
  }
}

const queryFixtures = async (
  status: HomeFixture['status'],
  { limit, upcomingOnly }: { limit: number; upcomingOnly?: boolean },
): Promise<HomeFixture[]> => {
  const [football, nfl, fights] = await Promise.all([
    getFootballMatches({ status, upcomingOnly, limit }),
    getNFLGames({ status, upcomingOnly, limit }),
    getFights({ status, limit, sportSlug: 'boxing' }),
  ])

  return [
    ...football.docs.map(fromFootballMatch),
    ...nfl.docs.map(fromNFLGame),
    ...fights.docs.map(fromFight),
  ]
}

// Live fixtures first; falls back to the nearest upcoming ones so the
// section is never an empty shell when nothing is live right now.
export const getHomeLiveOrUpcoming = async (
  limit = 6,
): Promise<{ fixtures: HomeFixture[]; isLive: boolean }> => {
  const live = await queryFixtures('live', { limit })
  if (live.length > 0) {
    return { fixtures: live.sort((a, b) => a.kickoff.localeCompare(b.kickoff)).slice(0, limit), isLive: true }
  }

  const upcoming = await queryFixtures('scheduled', { limit, upcomingOnly: true })
  return { fixtures: upcoming.sort((a, b) => a.kickoff.localeCompare(b.kickoff)).slice(0, limit), isLive: false }
}

export const getHomeRecentResults = async (limit = 6): Promise<HomeFixture[]> => {
  const finished = await queryFixtures('finished', { limit })
  return finished.sort((a, b) => b.kickoff.localeCompare(a.kickoff)).slice(0, limit)
}
