import type { Metadata } from 'next'
import type { Where } from 'payload'

import type { NflGame, Team } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { getMatchMetadata } from '@/lib/seo'
import { getCompetitionsBySport, getSportBySlug, type PopulatedCompetition } from '@/lib/sports'

export type PopulatedNFLGame = Omit<NflGame, 'homeTeam' | 'awayTeam' | 'competition'> & {
  homeTeam: Team
  awayTeam: Team
  competition: PopulatedCompetition
}

// NFL and NCAA Football are separate Sports (different competition tiers of
// the same underlying sport), but share this one `nfl-games` collection since
// the game shape is identical. Any page that needs to decide whether a given
// team/competition's games live here should check against this set rather
// than a single hardcoded slug.
export const NFL_GAMES_SPORT_SLUGS = new Set(['nfl', 'ncaa-football'])

// Because the collection is shared, "all games for this sport" always has to
// go through this — querying nfl-games unscoped would blend NFL and NCAA
// Football together. Returns [] if the sport doesn't exist yet.
export const getCompetitionIdsForSport = async (sportSlug: string): Promise<(number | string)[]> => {
  const sport = await getSportBySlug(sportSlug)
  if (!sport) return []
  const competitions = await getCompetitionsBySport(sport.id)
  return competitions.map((competition) => competition.id)
}

export const getNFLGames = async ({
  limit = 20,
  page = 1,
  competitionId,
  competitionIds,
  teamId,
  status,
  upcomingOnly,
}: {
  limit?: number
  page?: number
  competitionId?: number | string
  // Since NFL and NCAA Football share this collection, a hub page scoped to
  // one sport must filter by that sport's competition(s) — otherwise it pulls
  // in games from the other sport too. Use this (or getNFLGamesForSport)
  // instead of competitionId whenever "all games for this sport" is the
  // intent.
  competitionIds?: (number | string)[]
  teamId?: number | string
  status?: NflGame['status']
  upcomingOnly?: boolean
} = {}) => {
  const payload = await getPayloadClient()

  const where: Where = {}
  if (competitionId) where.competition = { equals: competitionId }
  if (competitionIds !== undefined) {
    // An explicit empty list means "this sport has no competitions yet" —
    // must match nothing, not fall through to "no filter" (which would
    // return the other sport's games too).
    where.competition = { in: competitionIds.length > 0 ? competitionIds : [-1] }
  }
  if (status) where.status = { equals: status }
  if (upcomingOnly) where.kickoffTime = { greater_than_equal: new Date().toISOString() }
  if (teamId) {
    where.or = [{ homeTeam: { equals: teamId } }, { awayTeam: { equals: teamId } }]
  }

  const result = await payload.find({
    collection: 'nfl-games',
    where,
    sort: upcomingOnly ? 'kickoffTime' : '-kickoffTime',
    limit,
    page,
    depth: 2,
  })

  return {
    ...result,
    docs: result.docs as unknown as PopulatedNFLGame[],
  }
}

// Convenience wrapper around getNFLGames that does the sport -> competitions
// lookup for you. Prefer this on any /nfl or /ncaa page.
export const getNFLGamesForSport = async (
  sportSlug: string,
  options: Omit<Parameters<typeof getNFLGames>[0], 'competitionIds' | 'competitionId'> = {},
) => {
  const competitionIds = await getCompetitionIdsForSport(sportSlug)
  return getNFLGames({ ...options, competitionIds })
}

export const getNFLGameBySlug = async (slug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'nfl-games',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })

  return (result.docs[0] as unknown as PopulatedNFLGame) || null
}

// Same sport-scoping safeguard as AmericanFootballGamePage — a game that
// belongs to the other sport must not produce metadata at this URL either.
export const getNFLGameMetadataForSport = async (
  slug: string,
  sportSlug: string,
  basePath: string,
): Promise<Metadata> => {
  const game = await getNFLGameBySlug(slug)
  if (!game || game.competition.sport.slug !== sportSlug) return {}
  return getMatchMetadata(game, basePath)
}

export const getAllNFLGameSlugsForSport = async (sportSlug: string) => {
  const competitionIds = await getCompetitionIdsForSport(sportSlug)
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'nfl-games',
    where: { competition: { in: competitionIds.length > 0 ? competitionIds : [-1] } },
    limit: 1000,
    depth: 0,
    select: { slug: true, updatedAt: true },
  })

  return result.docs
}
