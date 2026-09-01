import { getPayloadClient } from '@/lib/payload'
import {
  normalizeBasketballCompetition,
  normalizeBasketballGame,
  normalizeBasketballTeam,
  type RawBasketballGame,
  type RawBasketballLeague,
  type RawBasketballTeam,
} from '../adapters/basketball'
import { apiSportsFetch } from '../providers/api-sports/client'
import { findTeamIdByExternalId, getOrCreateSport, upsertCompetition, upsertTeam } from './upsert'

const BASKETBALL_SPORT_SLUG = 'basketball'
const BASKETBALL_SPORT_NAME = 'Basketball'

const METADATA_TTL_SECONDS = 60 * 60 * 24
const GAMES_TTL_SECONDS = 60 * 5

export type BasketballSyncResult = {
  season: string
  teamsUpserted: number
  gamesUpserted: number
  gamesSkipped: number
}

/**
 * Syncs one basketball competition (by api-sports.io league id — 12 = NBA)
 * for one season. Structurally the same as syncRugbyCompetition/
 * syncFootballCompetition, with one difference: `season` here is a
 * "2025-2026"-style string resolved by date range (see
 * resolveCurrentBasketballSeason), not a plain year — the provider gives
 * basketball leagues no `current` flag at all.
 */
export const syncBasketballCompetition = async (
  leagueExternalId: string,
  season?: string,
): Promise<BasketballSyncResult> => {
  const payload = await getPayloadClient()
  const sportId = await getOrCreateSport(BASKETBALL_SPORT_NAME, BASKETBALL_SPORT_SLUG)

  const rawLeagues = await apiSportsFetch(
    'basketball',
    'leagues',
    { id: leagueExternalId },
    { cacheKey: `basketball:league:${leagueExternalId}`, ttlSeconds: METADATA_TTL_SECONDS },
  )
  const rawLeague = rawLeagues[0] as RawBasketballLeague | undefined
  if (!rawLeague) {
    throw new Error(`api-sports.io returned no league for id ${leagueExternalId}`)
  }
  const normalizedCompetition = normalizeBasketballCompetition(rawLeague)
  const resolvedSeason = season ?? normalizedCompetition.season
  if (!resolvedSeason) {
    throw new Error(`api-sports.io league ${leagueExternalId} has no seasons to sync.`)
  }
  const competitionId = await upsertCompetition(sportId, normalizedCompetition)

  const rawTeams = (await apiSportsFetch(
    'basketball',
    'teams',
    { league: leagueExternalId, season: resolvedSeason },
    {
      cacheKey: `basketball:teams:${leagueExternalId}:${resolvedSeason}`,
      ttlSeconds: METADATA_TTL_SECONDS,
    },
  )) as RawBasketballTeam[]

  let teamsUpserted = 0
  for (const rawTeam of rawTeams) {
    await upsertTeam(sportId, normalizeBasketballTeam(rawTeam))
    teamsUpserted += 1
  }

  const rawGames = (await apiSportsFetch(
    'basketball',
    'games',
    { league: leagueExternalId, season: resolvedSeason },
    {
      cacheKey: `basketball:games:${leagueExternalId}:${resolvedSeason}`,
      ttlSeconds: GAMES_TTL_SECONDS,
    },
  )) as RawBasketballGame[]

  let gamesUpserted = 0
  let gamesSkipped = 0

  for (const rawGame of rawGames) {
    const normalized = normalizeBasketballGame(rawGame)

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
      tipoffTime: normalized.tipoffTime,
      venue: normalized.venue,
      status: normalized.status,
      homeScore: normalized.homeScore,
      awayScore: normalized.awayScore,
      season: normalized.season,
      externalId: normalized.externalId,
    }

    const existing = await payload.find({
      collection: 'basketball-games',
      where: { externalId: { equals: normalized.externalId } },
      limit: 1,
    })

    if (existing.docs[0]) {
      await payload.update({ collection: 'basketball-games', id: existing.docs[0].id, data })
    } else {
      await payload.create({ collection: 'basketball-games', data: { ...data, slug: '' } })
    }

    gamesUpserted += 1
  }

  return { season: resolvedSeason, teamsUpserted, gamesUpserted, gamesSkipped }
}
