// Shared by every team-sport adapter (football, nfl, rugby) that gets a
// `seasons: { year, current }[]` array back from api-sports.io's /leagues
// endpoint. Some leagues never flag a season `current` (e.g. an annual
// tournament between editions — confirmed live for Rugby's Six Nations,
// where every season came back `current: false`), and the array is not
// guaranteed to be in chronological order (also confirmed live) — so
// falling back to "last element" is wrong. Falling back to the highest year
// is the only assumption that holds regardless of provider ordering.
export const resolveCurrentSeasonYear = (seasons: { year: number; current: boolean }[]): number | undefined => {
  const flagged = seasons.find((season) => season.current)
  if (flagged) return flagged.year

  return seasons.reduce<number | undefined>(
    (max, season) => (max === undefined || season.year > max ? season.year : max),
    undefined,
  )
}
