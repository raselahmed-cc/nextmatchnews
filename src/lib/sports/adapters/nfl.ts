import type { EventStatus, NormalizedCompetition, NormalizedNFLGame, NormalizedTeam } from '../types'
import { resolveCurrentSeasonYear } from './shared'

// Field shapes below are transcribed from real api-sports.io responses
// (american-football host, `/leagues`, `/teams`, `/games`) inspected live
// during Phase 6. League id 1 = NFL, id 2 = NCAA — both live under this same
// host, matching how we model them as separate Sports sharing one games
// collection (see src/collections/NFLGames.ts).

export type RawNFLLeague = {
  league: { id: number; name: string; logo: string }
  country: { name: string }
  seasons: { year: number; current: boolean }[]
}

export const normalizeNFLCompetition = (raw: RawNFLLeague): NormalizedCompetition => {
  const currentSeasonYear = resolveCurrentSeasonYear(raw.seasons)

  return {
    externalId: String(raw.league.id),
    name: raw.league.name,
    country: raw.country?.name,
    logoUrl: raw.league.logo,
    season: currentSeasonYear !== undefined ? String(currentSeasonYear) : undefined,
  }
}

export type RawNFLTeam = {
  id: number
  name: string
  code: string | null
  logo: string
  country: { name: string } | null
}

export const normalizeNFLTeam = (raw: RawNFLTeam): NormalizedTeam => ({
  externalId: String(raw.id),
  name: raw.name,
  shortName: raw.code ?? undefined,
  logoUrl: raw.logo,
  country: raw.country?.name,
})

// Only "FT" (finished) was directly confirmed from live data — the
// in-progress/not-started codes are inferred from api-sports.io's documented
// convention for this API family. Anything unrecognized safely defaults to
// "scheduled" rather than throwing, so a wrong guess here degrades gracefully
// instead of breaking sync.
const GAME_STATUS_MAP: Record<string, EventStatus> = {
  NS: 'scheduled',
  Q1: 'live',
  Q2: 'live',
  Q3: 'live',
  Q4: 'live',
  OT: 'live',
  HT: 'live',
  FT: 'finished',
  AOT: 'finished',
  POST: 'postponed',
  CANC: 'cancelled',
  ABD: 'cancelled',
}

export type RawNFLGame = {
  game: {
    id: number
    week: string | null
    date: { timestamp: number }
    venue: { name: string | null } | null
    status: { short: string }
  }
  league: { id: number; season: string }
  teams: { home: { id: number }; away: { id: number } }
  scores: { home: { total: number | null }; away: { total: number | null } }
}

export const normalizeNFLGame = (raw: RawNFLGame): NormalizedNFLGame => ({
  externalId: String(raw.game.id),
  competitionExternalId: String(raw.league.id),
  homeTeamExternalId: String(raw.teams.home.id),
  awayTeamExternalId: String(raw.teams.away.id),
  kickoffTime: new Date(raw.game.date.timestamp * 1000).toISOString(),
  venue: raw.game.venue?.name ?? undefined,
  status: GAME_STATUS_MAP[raw.game.status.short] ?? 'scheduled',
  homeScore: raw.scores.home.total ?? undefined,
  awayScore: raw.scores.away.total ?? undefined,
  week: raw.game.week ?? undefined,
  season: raw.league.season,
})
