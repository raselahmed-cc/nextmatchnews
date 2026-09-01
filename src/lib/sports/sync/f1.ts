import { getPayloadClient } from '@/lib/payload'
import {
  normalizeF1Driver,
  normalizeF1Race,
  normalizeF1RaceResult,
  normalizeF1Team,
  resolveF1CurrentSeasonYear,
  type RawF1Race,
  type RawF1RaceResult,
  type RawF1RankedDriver,
  type RawF1Team,
} from '../adapters/f1'
import { apiSportsFetch } from '../providers/api-sports/client'
import {
  findPlayerIdByExternalId,
  findTeamIdByExternalId,
  getOrCreateSport,
  upsertCompetition,
  upsertPlayer,
  upsertTeam,
} from './upsert'

const F1_SPORT_SLUG = 'formula-1'
const F1_SPORT_NAME = 'Formula 1'

const METADATA_TTL_SECONDS = 60 * 60 * 24
const RACES_TTL_SECONDS = 60 * 60
const RESULTS_TTL_SECONDS = 60 * 5

type RaceResultRow = {
  driver: number
  team: number | null
  position?: number
  time?: string
  laps?: number
  grid?: string
}

export type F1SyncResult = {
  season: string
  teamsUpserted: number
  driversUpserted: number
  racesUpserted: number
}

/**
 * Syncs one Formula 1 season: constructors (into the shared Teams
 * collection), the driver roster (into Players — see NormalizedPlayer),
 * and every completed/scheduled Grand Prix (into F1Races), each with its
 * finishing order fetched separately per race.
 *
 * `season` is optional, same reasoning as syncFootballCompetition — omit it
 * to resolve to whatever's currently the latest season api-sports.io
 * offers, so a plan upgrade starts pulling the live season automatically
 * with no code change. F1 has no per-season "league" concept, so unlike
 * football/nfl/rugby there's no /leagues call here — /seasons is just a
 * flat list of years (see resolveF1CurrentSeasonYear).
 */
export const syncF1Season = async (season?: string): Promise<F1SyncResult> => {
  const payload = await getPayloadClient()
  const sportId = await getOrCreateSport(F1_SPORT_NAME, F1_SPORT_SLUG)

  let resolvedSeason = season
  if (!resolvedSeason) {
    const seasons = (await apiSportsFetch(
      'formula1',
      'seasons',
      {},
      { cacheKey: 'formula1:seasons', ttlSeconds: METADATA_TTL_SECONDS },
    )) as number[]
    const currentYear = resolveF1CurrentSeasonYear(seasons)
    if (currentYear === undefined) {
      throw new Error('api-sports.io returned no F1 seasons to sync.')
    }
    resolvedSeason = String(currentYear)
  }

  // F1 has no provider-assigned "league id" for its season-level
  // competition the way football/nfl/rugby do — this externalId is one we
  // synthesize ourselves, not one that came from api-sports.io.
  const competitionExternalId = `f1-${resolvedSeason}`
  const competitionId = await upsertCompetition(sportId, {
    externalId: competitionExternalId,
    name: `Formula 1 World Championship ${resolvedSeason}`,
    season: resolvedSeason,
  })

  const rawTeams = (await apiSportsFetch(
    'formula1',
    'teams',
    {},
    { cacheKey: 'formula1:teams', ttlSeconds: METADATA_TTL_SECONDS },
  )) as RawF1Team[]

  let teamsUpserted = 0
  for (const rawTeam of rawTeams) {
    await upsertTeam(sportId, normalizeF1Team(rawTeam))
    teamsUpserted += 1
  }

  const rawDrivers = (await apiSportsFetch(
    'formula1',
    'rankings/drivers',
    { season: resolvedSeason },
    { cacheKey: `formula1:rankings-drivers:${resolvedSeason}`, ttlSeconds: METADATA_TTL_SECONDS },
  )) as RawF1RankedDriver[]

  let driversUpserted = 0
  for (const rawDriver of rawDrivers) {
    await upsertPlayer(sportId, normalizeF1Driver(rawDriver))
    driversUpserted += 1
  }

  const rawRaces = (await apiSportsFetch(
    'formula1',
    'races',
    { season: resolvedSeason },
    { cacheKey: `formula1:races:${resolvedSeason}`, ttlSeconds: RACES_TTL_SECONDS },
  )) as RawF1Race[]

  let racesUpserted = 0

  // A Grand Prix weekend is several sessions sharing one `competition` id
  // (practice, qualifying, sprint, race) — only the main race is synced.
  for (const rawRace of rawRaces.filter((race) => race.type === 'Race')) {
    const normalized = normalizeF1Race(rawRace, competitionExternalId)

    const rawResults = (await apiSportsFetch(
      'formula1',
      'rankings/races',
      { race: normalized.externalId },
      { cacheKey: `formula1:rankings-races:${normalized.externalId}`, ttlSeconds: RESULTS_TTL_SECONDS },
    )) as RawF1RaceResult[]

    const results: RaceResultRow[] = []
    for (const rawResult of rawResults) {
      const normalizedResult = normalizeF1RaceResult(rawResult)
      const [driverId, teamId] = await Promise.all([
        findPlayerIdByExternalId(sportId, normalizedResult.driverExternalId),
        normalizedResult.teamExternalId
          ? findTeamIdByExternalId(sportId, normalizedResult.teamExternalId)
          : Promise.resolve(null),
      ])

      // Driver not in this season's synced roster — skip that one row
      // rather than dropping the whole race.
      if (!driverId) continue

      results.push({
        driver: driverId,
        team: teamId,
        position: normalizedResult.position,
        time: normalizedResult.time,
        laps: normalizedResult.laps,
        grid: normalizedResult.grid,
      })
    }

    const data = {
      name: normalized.name,
      competition: competitionId,
      circuitName: normalized.circuitName,
      circuitCountry: normalized.circuitCountry,
      circuitCity: normalized.circuitCity,
      date: normalized.date,
      status: normalized.status,
      laps: normalized.laps,
      distance: normalized.distance,
      season: normalized.season,
      results,
      externalId: normalized.externalId,
    }

    const existing = await payload.find({
      collection: 'f1-races',
      where: { externalId: { equals: normalized.externalId } },
      limit: 1,
    })

    if (existing.docs[0]) {
      await payload.update({ collection: 'f1-races', id: existing.docs[0].id, data })
    } else {
      await payload.create({ collection: 'f1-races', data: { ...data, slug: '' } })
    }

    racesUpserted += 1
  }

  return { season: resolvedSeason, teamsUpserted, driversUpserted, racesUpserted }
}
