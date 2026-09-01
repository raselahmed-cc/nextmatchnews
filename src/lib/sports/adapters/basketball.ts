import type { EventStatus, NormalizedBasketballGame, NormalizedCompetition, NormalizedTeam } from '../types'

// Field shapes below are transcribed from real api-sports.io responses
// (basketball host, `/leagues`, `/teams`, `/games`) inspected live for the
// NBA (league id 12). Like rugby, /leagues and /teams are FLAT (no nested
// `league:`/`team:` wrapper) — do not assume football's nesting here.
//
// Basketball seasons are a genuinely different shape from every other sport
// wired up so far: `season` is a string like "2025-2026" (not a plain
// year), and no season is ever flagged `current` — confirmed live across
// all 19 seasons NBA (league 12) returns. So "current season" has to be
// inferred from each season's start/end dates instead of a flag or a max()
// of years — see resolveCurrentBasketballSeason.

export type RawBasketballLeagueSeason = { season: string; start: string; end: string }

export type RawBasketballLeague = {
  id: number
  name: string
  logo: string
  country: { name: string }
  seasons: RawBasketballLeagueSeason[]
}

/**
 * Picks the season whose date range contains today; if none does (the
 * off-season gap between two NBA seasons — the exact case hit testing this
 * live in September), prefers the soonest upcoming season over the most
 * recently finished one, since that's what "current" means once games
 * start being added to it.
 */
export const resolveCurrentBasketballSeason = (
  seasons: RawBasketballLeagueSeason[],
  now: Date = new Date(),
): string | undefined => {
  const today = now.toISOString().slice(0, 10)

  const inProgress = seasons.find((season) => season.start <= today && today <= season.end)
  if (inProgress) return inProgress.season

  const upcoming = seasons
    .filter((season) => season.start > today)
    .sort((a, b) => a.start.localeCompare(b.start))[0]
  if (upcoming) return upcoming.season

  const mostRecentlyFinished = seasons
    .filter((season) => season.end < today)
    .sort((a, b) => b.end.localeCompare(a.end))[0]
  return mostRecentlyFinished?.season
}

export const normalizeBasketballCompetition = (raw: RawBasketballLeague): NormalizedCompetition => ({
  externalId: String(raw.id),
  name: raw.name,
  country: raw.country?.name,
  logoUrl: raw.logo,
  season: resolveCurrentBasketballSeason(raw.seasons),
})

export type RawBasketballTeam = {
  id: number
  name: string
  logo: string
  country: { name: string } | null
}

export const normalizeBasketballTeam = (raw: RawBasketballTeam): NormalizedTeam => ({
  externalId: String(raw.id),
  name: raw.name,
  logoUrl: raw.logo,
  country: raw.country?.name,
})

// Only "FT" (Game Finished) confirmed from live data — the rest follow
// api-sports.io's documented convention shared across their sport APIs.
// Unrecognized codes default to "scheduled" rather than throwing.
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

export type RawBasketballGame = {
  id: number
  date: string
  venue: string | null
  status: { short: string }
  league: { id: number; season: string }
  teams: { home: { id: number }; away: { id: number } }
  scores: { home: { total: number | null }; away: { total: number | null } }
}

export const normalizeBasketballGame = (raw: RawBasketballGame): NormalizedBasketballGame => ({
  externalId: String(raw.id),
  competitionExternalId: String(raw.league.id),
  homeTeamExternalId: String(raw.teams.home.id),
  awayTeamExternalId: String(raw.teams.away.id),
  tipoffTime: raw.date,
  venue: raw.venue ?? undefined,
  status: GAME_STATUS_MAP[raw.status.short] ?? 'scheduled',
  homeScore: raw.scores.home.total ?? undefined,
  awayScore: raw.scores.away.total ?? undefined,
  season: raw.league.season,
})
