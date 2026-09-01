import { getPayloadClient } from '@/lib/payload'
import {
  normalizeFootballCompetition,
  normalizeFootballFixture,
  normalizeFootballTeam,
  type RawFootballFixture,
  type RawFootballLeague,
  type RawFootballTeam,
} from '../adapters/football'
import { apiSportsFetch } from '../providers/api-sports/client'
import { findTeamIdByExternalId, getOrCreateSport, upsertCompetition, upsertTeam } from './upsert'

const FOOTBALL_SPORT_SLUG = 'football'
const FOOTBALL_SPORT_NAME = 'Football'

// Competition/team metadata barely changes day to day — cache generously.
// Fixtures (scores, live status) change often — cache briefly.
const METADATA_TTL_SECONDS = 60 * 60 * 24
const FIXTURES_TTL_SECONDS = 60 * 5

export type FootballSyncResult = {
  season: string
  teamsUpserted: number
  fixturesUpserted: number
  fixturesSkipped: number
}

/**
 * Syncs one football competition (by api-sports.io league id) for one
 * season: upserts the Competition, every Team in it, and every fixture,
 * matching existing records by `externalId` so re-running this updates
 * scores/status instead of creating duplicates.
 *
 * `season` is optional and should normally be omitted — when it is, the
 * season api-sports.io itself flags as `current` for this league is used
 * (see normalizeFootballCompetition). That's what makes a plan upgrade
 * "automatic": on the free tier the current season is outside the
 * 2022-2024 window it allows and the /teams or /fixtures call below throws
 * (caught by the API route calling this), but the exact same call starts
 * succeeding the moment the account can see the current season — no code
 * change needed. Pass an explicit `season` only for a deliberate historical
 * backfill.
 */
export const syncFootballCompetition = async (
  leagueExternalId: string,
  season?: string,
): Promise<FootballSyncResult> => {
  const payload = await getPayloadClient()
  const sportId = await getOrCreateSport(FOOTBALL_SPORT_NAME, FOOTBALL_SPORT_SLUG)

  const rawLeagues = await apiSportsFetch(
    'football',
    'leagues',
    { id: leagueExternalId },
    { cacheKey: `football:league:${leagueExternalId}`, ttlSeconds: METADATA_TTL_SECONDS },
  )
  const rawLeague = rawLeagues[0] as RawFootballLeague | undefined
  if (!rawLeague) {
    throw new Error(`api-sports.io returned no league for id ${leagueExternalId}`)
  }
  const normalizedCompetition = normalizeFootballCompetition(rawLeague)
  const resolvedSeason = season ?? normalizedCompetition.season
  if (!resolvedSeason) {
    throw new Error(`api-sports.io league ${leagueExternalId} has no seasons to sync.`)
  }
  const competitionId = await upsertCompetition(sportId, normalizedCompetition)

  const rawTeams = (await apiSportsFetch(
    'football',
    'teams',
    { league: leagueExternalId, season: resolvedSeason },
    {
      cacheKey: `football:teams:${leagueExternalId}:${resolvedSeason}`,
      ttlSeconds: METADATA_TTL_SECONDS,
    },
  )) as RawFootballTeam[]

  let teamsUpserted = 0
  for (const rawTeam of rawTeams) {
    await upsertTeam(sportId, normalizeFootballTeam(rawTeam))
    teamsUpserted += 1
  }

  const rawFixtures = (await apiSportsFetch(
    'football',
    'fixtures',
    { league: leagueExternalId, season: resolvedSeason },
    {
      cacheKey: `football:fixtures:${leagueExternalId}:${resolvedSeason}`,
      ttlSeconds: FIXTURES_TTL_SECONDS,
    },
  )) as RawFootballFixture[]

  let fixturesUpserted = 0
  let fixturesSkipped = 0

  for (const rawFixture of rawFixtures) {
    const normalized = normalizeFootballFixture(rawFixture)

    const [homeTeamId, awayTeamId] = await Promise.all([
      findTeamIdByExternalId(sportId, normalized.homeTeamExternalId),
      findTeamIdByExternalId(sportId, normalized.awayTeamExternalId),
    ])

    if (!homeTeamId || !awayTeamId) {
      // Team wasn't in this season's /teams response (e.g. relegated/
      // promoted mid-dataset) — skip rather than create a match with a
      // missing side.
      fixturesSkipped += 1
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
      round: normalized.round,
      season: normalized.season,
      externalId: normalized.externalId,
    }

    const existing = await payload.find({
      collection: 'football-matches',
      where: { externalId: { equals: normalized.externalId } },
      limit: 1,
    })

    if (existing.docs[0]) {
      // Omitting slug here leaves the existing one untouched — its
      // beforeValidate hook only regenerates when the incoming value is
      // empty, so an update with no slug field just re-confirms what's
      // already stored.
      await payload.update({ collection: 'football-matches', id: existing.docs[0].id, data })
    } else {
      await payload.create({ collection: 'football-matches', data: { ...data, slug: '' } })
    }

    fixturesUpserted += 1
  }

  return { season: resolvedSeason, teamsUpserted, fixturesUpserted, fixturesSkipped }
}
