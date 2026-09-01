import type { EventStatus, NormalizedCompetition, NormalizedFootballFixture, NormalizedTeam } from '../types'
import { resolveCurrentSeasonYear } from './shared'

// Field shapes below are transcribed from real api-sports.io responses
// (football host, `/leagues`, `/teams`, `/fixtures`) inspected live during
// Phase 6 — not guessed from documentation. Only the fields we actually use
// are typed; the raw responses carry much more (coverage flags, venue
// capacity, etc.) that we deliberately ignore.

export type RawFootballLeague = {
  league: { id: number; name: string; logo: string }
  country: { name: string }
  seasons: { year: number; current: boolean }[]
}

export const normalizeFootballCompetition = (raw: RawFootballLeague): NormalizedCompetition => {
  const currentSeasonYear = resolveCurrentSeasonYear(raw.seasons)

  return {
    externalId: String(raw.league.id),
    name: raw.league.name,
    country: raw.country?.name,
    logoUrl: raw.league.logo,
    season: currentSeasonYear !== undefined ? String(currentSeasonYear) : undefined,
  }
}

export type RawFootballTeam = {
  team: { id: number; name: string; code: string | null; country: string; logo: string }
}

export const normalizeFootballTeam = (raw: RawFootballTeam): NormalizedTeam => ({
  externalId: String(raw.team.id),
  name: raw.team.name,
  shortName: raw.team.code ?? undefined,
  logoUrl: raw.team.logo,
  country: raw.team.country,
})

// api-sports.io's football fixture status codes (confirmed "NS"/"FT" from
// live data; the rest are the platform's documented convention). Anything
// unrecognized safely defaults to "scheduled" rather than throwing.
const FIXTURE_STATUS_MAP: Record<string, EventStatus> = {
  TBD: 'scheduled',
  NS: 'scheduled',
  '1H': 'live',
  HT: 'live',
  '2H': 'live',
  ET: 'live',
  BT: 'live',
  P: 'live',
  SUSP: 'live',
  INT: 'live',
  LIVE: 'live',
  FT: 'finished',
  AET: 'finished',
  PEN: 'finished',
  AWD: 'finished',
  WO: 'finished',
  PST: 'postponed',
  CANC: 'cancelled',
  ABD: 'cancelled',
}

export type RawFootballFixture = {
  fixture: {
    id: number
    date: string
    venue: { name: string | null } | null
    status: { short: string }
  }
  league: { id: number; round: string; season: number }
  teams: { home: { id: number }; away: { id: number } }
  goals: { home: number | null; away: number | null }
}

export const normalizeFootballFixture = (raw: RawFootballFixture): NormalizedFootballFixture => ({
  externalId: String(raw.fixture.id),
  competitionExternalId: String(raw.league.id),
  homeTeamExternalId: String(raw.teams.home.id),
  awayTeamExternalId: String(raw.teams.away.id),
  kickoffTime: raw.fixture.date,
  venue: raw.fixture.venue?.name ?? undefined,
  status: FIXTURE_STATUS_MAP[raw.fixture.status.short] ?? 'scheduled',
  homeScore: raw.goals.home ?? undefined,
  awayScore: raw.goals.away ?? undefined,
  round: raw.league.round,
  season: String(raw.league.season),
})
