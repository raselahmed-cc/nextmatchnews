import type { Field } from 'payload'

// The sports-data provider's own ID for this record. Populated by sync code
// (Phase 6), not editors — it's what lets a re-sync update the existing row
// instead of creating a duplicate. Left blank on manually-entered records.
//
// `unique` defaults to true, correct for collections that only ever hold
// one sport's rows (FootballMatches, NFLGames, RugbyMatches,
// BasketballGames, F1Races — each is its own table, so externalId spaces
// never cross). Pass `unique: false` for collections shared *across*
// sports (Teams, Competitions, Players) — different api-sports.io hosts
// hand out their own small, overlapping id ranges (e.g. NFL team ids and
// F1 constructor ids both start at 1), so a global unique constraint there
// is actively wrong: it let an F1 sync silently overwrite 20 real NFL team
// rows that happened to share the same externalId. Uniqueness for those
// collections is enforced by the sync layer instead, scoped by sport (see
// src/lib/sports/sync/upsert.ts).
export const externalIdField = ({ unique = true }: { unique?: boolean } = {}): Field => ({
  name: 'externalId',
  type: 'text',
  unique,
  index: true,
  admin: {
    position: 'sidebar',
    readOnly: true,
    description: "The sports data provider's own ID for this record. Set automatically by sync — do not edit.",
  },
})
