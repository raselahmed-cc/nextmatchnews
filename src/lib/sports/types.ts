// Normalized shapes that any provider's adapter must produce, regardless of
// that provider's own API structure — the boundary CLAUDE.md §9 describes:
// external "fixture" -> internal FootballMatch, external "game" -> internal
// NFLGame. Adapters (src/lib/sports/adapters/, written once a provider's
// real response shape can be inspected) translate raw provider JSON into
// these types; nothing else in the app should ever see a raw provider shape.
//
// `externalId` on each type is the provider's own identifier for that
// record — it's what the sync layer matches against the `externalId` field
// added to the Teams/Competitions/Players/FootballMatches/NFLGames
// collections, so re-syncing updates existing rows instead of duplicating
// them.

export type EventStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'

export type NormalizedTeam = {
  externalId: string
  name: string
  shortName?: string
  logoUrl?: string
  country?: string
}

export type NormalizedCompetition = {
  externalId: string
  name: string
  country?: string
  logoUrl?: string
  season?: string
}

export type NormalizedFootballFixture = {
  externalId: string
  competitionExternalId: string
  homeTeamExternalId: string
  awayTeamExternalId: string
  kickoffTime: string // ISO 8601
  venue?: string
  status: EventStatus
  homeScore?: number
  awayScore?: number
  round?: string
  season?: string
}

export type NormalizedNFLGame = {
  externalId: string
  competitionExternalId: string
  homeTeamExternalId: string
  awayTeamExternalId: string
  kickoffTime: string
  venue?: string
  status: EventStatus
  homeScore?: number
  awayScore?: number
  week?: string
  season?: string
}

export type NormalizedRugbyMatch = {
  externalId: string
  competitionExternalId: string
  homeTeamExternalId: string
  awayTeamExternalId: string
  kickoffTime: string
  status: EventStatus
  homeScore?: number
  awayScore?: number
  round?: string
  season?: string
}

export type NormalizedBasketballGame = {
  externalId: string
  competitionExternalId: string
  homeTeamExternalId: string
  awayTeamExternalId: string
  tipoffTime: string
  venue?: string
  status: EventStatus
  homeScore?: number
  awayScore?: number
  season?: string // api-sports.io basketball seasons are "2025-2026"-style strings, not a single year
}

// Individual athlete belonging to a Sport, optionally on a Team — matches
// the existing Players collection, which already generalizes to this shape.
// Used for F1 drivers rather than a new "Drivers" collection; a driver is
// structurally just a player of an individual sport who happens to have a
// team (their constructor).
export type NormalizedPlayer = {
  externalId: string
  name: string
  photoUrl?: string
  teamExternalId?: string
  nationality?: string
}

// api-sports.io's Formula 1 API has no single "fixture" concept — a Grand
// Prix weekend is several sessions (practice, qualifying, sprint, race)
// sharing one `competition` id. We only sync the `type: "Race"` session per
// weekend (the one result that matters editorially) — see adapters/f1.ts.
export type NormalizedF1Race = {
  externalId: string
  competitionExternalId: string // the season-level Competition we create, not api-sports' per-weekend `competition`
  name: string // Grand Prix name, e.g. "Bahrain Grand Prix"
  circuitName?: string
  circuitCountry?: string
  circuitCity?: string
  date: string // ISO 8601
  status: EventStatus
  laps?: number
  distance?: string
  season: string
}

export type NormalizedF1RaceResult = {
  driverExternalId: string
  teamExternalId?: string
  position?: number
  time?: string
  laps?: number
  grid?: string
}

// A provider adapter for football implements this contract. Its methods
// return already-normalized data — no provider-specific structure escapes
// this boundary into the rest of the app.
export interface FootballProvider {
  getCompetitions(): Promise<NormalizedCompetition[]>
  getTeams(competitionExternalId: string, season: string): Promise<NormalizedTeam[]>
  getFixtures(competitionExternalId: string, season: string): Promise<NormalizedFootballFixture[]>
}

export interface NFLProvider {
  getCompetitions(): Promise<NormalizedCompetition[]>
  getTeams(competitionExternalId: string, season: string): Promise<NormalizedTeam[]>
  getGames(competitionExternalId: string, season: string): Promise<NormalizedNFLGame[]>
}
