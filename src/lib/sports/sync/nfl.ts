import { getPayloadClient } from '@/lib/payload'
import {
  normalizeNFLCompetition,
  normalizeNFLGame,
  normalizeNFLTeam,
  type RawNFLGame,
  type RawNFLLeague,
  type RawNFLTeam,
} from '../adapters/nfl'
import { apiSportsFetch } from '../providers/api-sports/client'
import { findTeamIdByExternalId, getOrCreateSport, upsertCompetition, upsertTeam } from './upsert'

const METADATA_TTL_SECONDS = 60 * 60 * 24
const GAMES_TTL_SECONDS = 60 * 5

export type NFLSyncResult = {
  season: string
  teamsUpserted: number
  gamesUpserted: number
  gamesSkipped: number
}

/**
 * Syncs one American-football competition (api-sports.io league id 1 = NFL,
 * 2 = NCAA — see src/lib/sports/adapters/nfl.ts) for one season. `sportSlug`/
 * `sportName` select which of our two separate Sports (nfl vs ncaa-football)
 * this data belongs to — they're the same sport at different tiers, not the
 * same competition, so this must not be assumed/defaulted.
 *
 * `season` is optional and should normally be omitted — see the matching
 * comment on syncFootballCompetition (src/lib/sports/sync/football.ts) for
 * why: omitting it resolves to whatever api-sports.io itself currently
 * flags as the current season, which is what makes a plan upgrade pull live
 * data automatically with no code change.
 */
export const syncNFLCompetition = async (
  sportSlug: string,
  sportName: string,
  leagueExternalId: string,
  season?: string,
): Promise<NFLSyncResult> => {
  const payload = await getPayloadClient()
  const sportId = await getOrCreateSport(sportName, sportSlug)

  const rawLeagues = await apiSportsFetch(
    'nfl',
    'leagues',
    {},
    { cacheKey: 'nfl:leagues', ttlSeconds: METADATA_TTL_SECONDS },
  )
  const rawLeague = (rawLeagues as RawNFLLeague[]).find(
    (league) => String(league.league.id) === leagueExternalId,
  )
  if (!rawLeague) {
    throw new Error(`api-sports.io returned no league for id ${leagueExternalId}`)
  }
  const normalizedCompetition = normalizeNFLCompetition(rawLeague)
  const resolvedSeason = season ?? normalizedCompetition.season
  if (!resolvedSeason) {
    throw new Error(`api-sports.io league ${leagueExternalId} has no seasons to sync.`)
  }
  const competitionId = await upsertCompetition(sportId, normalizedCompetition)

  const rawTeams = (await apiSportsFetch(
    'nfl',
    'teams',
    { league: leagueExternalId, season: resolvedSeason },
    { cacheKey: `nfl:teams:${leagueExternalId}:${resolvedSeason}`, ttlSeconds: METADATA_TTL_SECONDS },
  )) as RawNFLTeam[]

  let teamsUpserted = 0
  for (const rawTeam of rawTeams) {
    await upsertTeam(sportId, normalizeNFLTeam(rawTeam))
    teamsUpserted += 1
  }

  const rawGames = (await apiSportsFetch(
    'nfl',
    'games',
    { league: leagueExternalId, season: resolvedSeason },
    { cacheKey: `nfl:games:${leagueExternalId}:${resolvedSeason}`, ttlSeconds: GAMES_TTL_SECONDS },
  )) as RawNFLGame[]

  let gamesUpserted = 0
  let gamesSkipped = 0

  for (const rawGame of rawGames) {
    const normalized = normalizeNFLGame(rawGame)

    const [homeTeamId, awayTeamId] = await Promise.all([
      findTeamIdByExternalId(sportId, normalized.homeTeamExternalId),
      findTeamIdByExternalId(sportId, normalized.awayTeamExternalId),
    ])

    if (!homeTeamId || !awayTeamId) {
      gamesSkipped += 1
      continue
    }

    const data = {
      homeTeam: homeTeamId,
      awayTeam: awayTeamId,
      competition: competitionId,
      kickoffTime: normalized.kickoffTime,
      venue: normalized.venue,
      status: normalized.status,
      homeScore: normalized.homeScore,
      awayScore: normalized.awayScore,
      week: normalized.week,
      season: normalized.season,
      externalId: normalized.externalId,
    }

    const existing = await payload.find({
      collection: 'nfl-games',
      where: { externalId: { equals: normalized.externalId } },
      limit: 1,
    })

    if (existing.docs[0]) {
      // Same reasoning as the football sync — omitting slug on update leaves
      // the existing stable slug untouched.
      await payload.update({ collection: 'nfl-games', id: existing.docs[0].id, data })
    } else {
      await payload.create({ collection: 'nfl-games', data: { ...data, slug: '' } })
    }

    gamesUpserted += 1
  }

  return { season: resolvedSeason, teamsUpserted, gamesUpserted, gamesSkipped }
}
