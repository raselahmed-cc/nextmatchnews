import type { MatchHighlight, Media, Sport } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { getSportBySlug } from '@/lib/sports'

export type PopulatedHighlight = Omit<MatchHighlight, 'sport' | 'thumbnail'> & {
  sport: Sport
  thumbnail: Media | null
}

export const getHighlightsBySport = async (
  sportSlug: string,
  limit = 6,
): Promise<PopulatedHighlight[]> => {
  const sport = await getSportBySlug(sportSlug)
  if (!sport) return []

  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'match-highlights',
    where: { sport: { equals: sport.id } },
    sort: '-publishedAt',
    limit,
    depth: 1,
  })

  return result.docs as unknown as PopulatedHighlight[]
}

// Cross-sport feed for the homepage — same query shape as
// getHighlightsBySport, just without the sport filter.
export const getRecentHighlights = async (limit = 6): Promise<PopulatedHighlight[]> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'match-highlights',
    sort: '-publishedAt',
    limit,
    depth: 1,
  })

  return result.docs as unknown as PopulatedHighlight[]
}
