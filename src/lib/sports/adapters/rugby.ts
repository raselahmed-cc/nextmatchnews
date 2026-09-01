import type { EventStatus, NormalizedCompetition, NormalizedRugbyMatch, NormalizedTeam } from '../types'
import { resolveCurrentSeasonYear } from './shared'

// Field shapes below are transcribed from real api-sports.io responses
// (rugby host, `/leagues`, `/teams`, `/games`) inspected live — not guessed
// from documentation. NOTE: unlike football/nfl, rugby's /leagues and
// /teams responses are FLAT (no nested `league: {...}` / `team: {...}`
// wrapper), and the season year lives under the key `season`, not `year`.
// Confirmed live after an initial wrong assumption (that it mirrored
// football's nesting) threw at runtime — do not "simplify" this back to
// match football's shape without re-checking a live response.

export type RawRugbyLeague = {
  id: number
  name: string
  logo: string
  country: { name: string }
  seasons: { season: number; current: boolean }[]
}

export const normalizeRugbyCompetition = (raw: RawRugbyLeague): NormalizedCompetition => {
  const currentSeasonYear = resolveCurrentSeasonYear(
    raw.seasons.map((season) => ({ year: season.season, current: season.current })),
  )

  return {
    externalId: String(raw.id),
    name: raw.name,
    country: raw.country?.name,
    logoUrl: raw.logo,
    season: currentSeasonYear !== undefined ? String(currentSeasonYear) : undefined,
  }
}

export type RawRugbyTeam = {
  id: number
  name: string
  logo: string
  country: { name: string } | null
}

export const normalizeRugbyTeam = (raw: RawRugbyTeam): NormalizedTeam => ({
  externalId: String(raw.id),
  name: raw.name,
  logoUrl: raw.logo,
  country: raw.country?.name,
})

// Only "FT" (finished) confirmed from live data so far — the rest follow
// api-sports.io's documented convention shared across their sport APIs.
// Unrecognized codes safely default to "scheduled" rather than throwing.
const GAME_STATUS_MAP: Record<string, EventStatus> = {
  NS: 'scheduled',
  '1H': 'live',
  HT: 'live',
  '2H': 'live',
  ET: 'live',
  FT: 'finished',
  AET: 'finished',
  POST: 'postponed',
  CANC: 'cancelled',
  ABD: 'cancelled',
}

export type RawRugbyGame = {
  id: number
  date: string
  week: string | null
  status: { short: string }
  league: { id: number; season: number }
  teams: { home: { id: number }; away: { id: number } }
  scores: { home: number | null; away: number | null }
}

export const normalizeRugbyMatch = (raw: RawRugbyGame): NormalizedRugbyMatch => ({
  externalId: String(raw.id),
  competitionExternalId: String(raw.league.id),
  homeTeamExternalId: String(raw.teams.home.id),
  awayTeamExternalId: String(raw.teams.away.id),
  kickoffTime: raw.date,
  status: GAME_STATUS_MAP[raw.status.short] ?? 'scheduled',
  homeScore: raw.scores.home ?? undefined,
  awayScore: raw.scores.away ?? undefined,
  round: raw.week ?? undefined,
  season: String(raw.league.season),
})
