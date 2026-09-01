import type { Where } from 'payload'

import type { FootballMatch, Team } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import type { PopulatedCompetition } from '@/lib/sports'

export type PopulatedFootballMatch = Omit<FootballMatch, 'homeTeam' | 'awayTeam' | 'competition'> & {
  homeTeam: Team
  awayTeam: Team
  competition: PopulatedCompetition
}

// Only queries `football-matches` today. Once NFL/basketball/NCAA game collections
// exist, callers that want "all matches for this team/competition" regardless of
// sport will need to check the team's/competition's `sport` and query the right
// collection — there's no cross-sport match aggregation yet.
export const getFootballMatches = async ({
  limit = 20,
  page = 1,
  competitionId,
  teamId,
  status,
  upcomingOnly,
}: {
  limit?: number
  page?: number
  competitionId?: number | string
  teamId?: number | string
  status?: FootballMatch['status']
  upcomingOnly?: boolean
} = {}) => {
  const payload = await getPayloadClient()

  const where: Where = {}
  if (competitionId) where.competition = { equals: competitionId }
  if (status) where.status = { equals: status }
  if (upcomingOnly) where.kickoffTime = { greater_than_equal: new Date().toISOString() }
  if (teamId) {
    where.or = [{ homeTeam: { equals: teamId } }, { awayTeam: { equals: teamId } }]
  }

  const result = await payload.find({
    collection: 'football-matches',
    where,
    sort: upcomingOnly ? 'kickoffTime' : '-kickoffTime',
    limit,
    page,
    depth: 2,
  })

  return {
    ...result,
    docs: result.docs as unknown as PopulatedFootballMatch[],
  }
}

export const getFootballMatchBySlug = async (slug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'football-matches',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })

  return (result.docs[0] as unknown as PopulatedFootballMatch) || null
}

export const getAllFootballMatchSlugs = async () => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'football-matches',
    limit: 1000,
    depth: 0,
    select: { slug: true, updatedAt: true },
  })

  return result.docs
}
