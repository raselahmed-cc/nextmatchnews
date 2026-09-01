import { getPayloadClient } from '@/lib/payload'
import {
  normalizeRugbyCompetition,
  normalizeRugbyMatch,
  normalizeRugbyTeam,
  type RawRugbyGame,
  type RawRugbyLeague,
  type RawRugbyTeam,
} from '../adapters/rugby'
import { apiSportsFetch } from '../providers/api-sports/client'
import { findTeamIdByExternalId, getOrCreateSport, upsertCompetition, upsertTeam } from './upsert'

const RUGBY_SPORT_SLUG = 'rugby'
const RUGBY_SPORT_NAME = 'Rugby'

const METADATA_TTL_SECONDS = 60 * 60 * 24
const GAMES_TTL_SECONDS = 60 * 5

export type RugbySyncResult = {
  season: string
  teamsUpserted: number
  matchesUpserted: number
  matchesSkipped: number
}

/**
 * Syncs one rugby competition (by api-sports.io league id) for one season.
 * Structurally identical to syncFootballCompetition (src/lib/sports/sync/
 * football.ts) — same reasoning applies for the optional `season` param
 * (omit it to resolve the provider's own current season) and for never
 * touching slug on update.
 */
export const syncRugbyCompetition = async (
  leagueExternalId: string,
  season?: string,
): Promise<RugbySyncResult> => {
  const payload = await getPayloadClient()
  const sportId = await getOrCreateSport(RUGBY_SPORT_NAME, RUGBY_SPORT_SLUG)

  const rawLeagues = await apiSportsFetch(
    'rugby',
    'leagues',
    { id: leagueExternalId },
    { cacheKey: `rugby:league:${leagueExternalId}`, ttlSeconds: METADATA_TTL_SECONDS },
  )
  const rawLeague = rawLeagues[0] as RawRugbyLeague | undefined
  if (!rawLeague) {
    throw new Error(`api-sports.io returned no league for id ${leagueExternalId}`)
  }
  const normalizedCompetition = normalizeRugbyCompetition(rawLeague)
  const resolvedSeason = season ?? normalizedCompetition.season
  if (!resolvedSeason) {
    throw new Error(`api-sports.io league ${leagueExternalId} has no seasons to sync.`)
  }
  const competitionId = await upsertCompetition(sportId, normalizedCompetition)

  const rawTeams = (await apiSportsFetch(
    'rugby',
    'teams',
    { league: leagueExternalId, season: resolvedSeason },
    {
      cacheKey: `rugby:teams:${leagueExternalId}:${resolvedSeason}`,
      ttlSeconds: METADATA_TTL_SECONDS,
    },
  )) as RawRugbyTeam[]

  let teamsUpserted = 0
  for (const rawTeam of rawTeams) {
    await upsertTeam(sportId, normalizeRugbyTeam(rawTeam))
    teamsUpserted += 1
  }

  const rawGames = (await apiSportsFetch(
    'rugby',
    'games',
    { league: leagueExternalId, season: resolvedSeason },
    {
      cacheKey: `rugby:games:${leagueExternalId}:${resolvedSeason}`,
      ttlSeconds: GAMES_TTL_SECONDS,
    },
  )) as RawRugbyGame[]

  let matchesUpserted = 0
  let matchesSkipped = 0

  for (const rawGame of rawGames) {
    const normalized = normalizeRugbyMatch(rawGame)

    const [homeTeamId, awayTeamId] = await Promise.all([
      findTeamIdByExternalId(sportId, normalized.homeTeamExternalId),
      findTeamIdByExternalId(sportId, normalized.awayTeamExternalId),
    ])

    if (!homeTeamId || !awayTeamId) {
      matchesSkipped += 1
      continue
    }

    const data = {
      homeTeam: homeTeamId,
      awayTeam: awayTeamId,
      competition: competitionId,
      kickoffTime: normalized.kickoffTime,
      status: normalized.status,
      homeScore: normalized.homeScore,
      awayScore: normalized.awayScore,
      round: normalized.round,
      season: normalized.season,
      externalId: normalized.externalId,
    }

    const existing = await payload.find({
      collection: 'rugby-matches',
      where: { externalId: { equals: normalized.externalId } },
      limit: 1,
    })

    if (existing.docs[0]) {
      await payload.update({ collection: 'rugby-matches', id: existing.docs[0].id, data })
    } else {
      await payload.create({ collection: 'rugby-matches', data: { ...data, slug: '' } })
    }

    matchesUpserted += 1
  }

  return { season: resolvedSeason, teamsUpserted, matchesUpserted, matchesSkipped }
}
