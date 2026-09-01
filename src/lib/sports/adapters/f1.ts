import type {
  EventStatus,
  NormalizedF1Race,
  NormalizedF1RaceResult,
  NormalizedPlayer,
  NormalizedTeam,
} from '../types'

// Field shapes below are transcribed from real api-sports.io responses
// (formula-1 host: /seasons, /teams, /rankings/drivers, /races,
// /rankings/races) inspected live. F1 has no "fixture" concept like the
// team sports — a Grand Prix weekend is several sessions (practice,
// qualifying, sprint, race) sharing one `competition` id; we only sync the
// `type: "Race"` session (see sync/f1.ts), and results come from a separate
// per-race rankings call, not embedded in /races.

// /seasons returns a flat list of years with no `current` flag (confirmed
// live: [2012, ..., 2026], unsorted-safe either way since we just take the
// max) — so "current season" is simply the highest year on offer.
export const resolveF1CurrentSeasonYear = (seasons: number[]): number | undefined =>
  seasons.length === 0 ? undefined : Math.max(...seasons)

export type RawF1Team = {
  id: number
  name: string
  logo: string
}

export const normalizeF1Team = (raw: RawF1Team): NormalizedTeam => ({
  externalId: String(raw.id),
  name: raw.name,
  logoUrl: raw.logo,
})

// From /rankings/drivers?season=X — the season's full driver roster with
// current-team affiliation. Full bio fields (nationality, birthdate, ...)
// live on /drivers?id=X but require one call per driver; not fetched here —
// data-layer-only pass, not worth 20+ extra requests per sync yet.
export type RawF1RankedDriver = {
  driver: { id: number; name: string; image: string }
  team: { id: number }
}

export const normalizeF1Driver = (raw: RawF1RankedDriver): NormalizedPlayer => ({
  externalId: String(raw.driver.id),
  name: raw.driver.name,
  photoUrl: raw.driver.image,
  teamExternalId: String(raw.team.id),
})

// Only "Completed" confirmed live; the rest follow api-sports.io's
// documented convention. Unrecognized values default to "scheduled" rather
// than throwing.
const RACE_STATUS_MAP: Record<string, EventStatus> = {
  Completed: 'finished',
  'In Progress': 'live',
  'Not Started': 'scheduled',
  Postponed: 'postponed',
  Cancelled: 'cancelled',
}

export type RawF1Race = {
  id: number
  competition: { id: number; name: string; location: { country: string; city: string } }
  circuit: { id: number; name: string }
  season: number
  type: string
  laps: { total: number | null }
  distance: string | null
  date: string
  status: string
}

// `competitionExternalId` is the season-level Competition we create
// ourselves (see sync/f1.ts) — api-sports' own `competition` id identifies
// the race *weekend*, not our season-level grouping, so it isn't reused.
export const normalizeF1Race = (raw: RawF1Race, competitionExternalId: string): NormalizedF1Race => ({
  externalId: String(raw.id),
  competitionExternalId,
  name: raw.competition.name,
  circuitName: raw.circuit.name,
  circuitCountry: raw.competition.location?.country,
  circuitCity: raw.competition.location?.city,
  date: raw.date,
  status: RACE_STATUS_MAP[raw.status] ?? 'scheduled',
  laps: raw.laps.total ?? undefined,
  distance: raw.distance ?? undefined,
  season: String(raw.season),
})

export type RawF1RaceResult = {
  driver: { id: number }
  team: { id: number }
  position: number | null
  time: string | null
  laps: number | null
  grid: string | null
}

export const normalizeF1RaceResult = (raw: RawF1RaceResult): NormalizedF1RaceResult => ({
  driverExternalId: String(raw.driver.id),
  teamExternalId: String(raw.team.id),
  position: raw.position ?? undefined,
  time: raw.time ?? undefined,
  laps: raw.laps ?? undefined,
  grid: raw.grid ?? undefined,
})
