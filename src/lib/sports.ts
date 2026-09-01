import type { Competition, Player, Sport, Team } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export type PopulatedTeam = Omit<Team, 'sport' | 'competitions'> & {
  sport: Sport
  competitions: Competition[] | null
}

export type PopulatedPlayer = Omit<Player, 'sport' | 'team'> & {
  sport: Sport
  team: Team | null
}

export type PopulatedCompetition = Omit<Competition, 'sport'> & {
  sport: Sport
}

export const getAllSports = async () => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'sports',
    sort: 'displayOrder',
    limit: 100,
  })

  return result.docs
}

export const getSportBySlug = async (slug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'sports',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  return result.docs[0] || null
}

export const getAllSportSlugs = async () => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'sports',
    limit: 1000,
    depth: 0,
    select: { slug: true },
  })

  return result.docs
}

export const getCompetitionsBySport = async (sportId: number | string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'competitions',
    where: { sport: { equals: sportId } },
    sort: 'name',
    limit: 100,
    depth: 1,
  })

  return result.docs as unknown as PopulatedCompetition[]
}

export const getCompetitionBySlug = async (slug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'competitions',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })

  return (result.docs[0] as unknown as PopulatedCompetition) || null
}

export const getAllCompetitionSlugs = async () => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'competitions',
    limit: 1000,
    depth: 0,
    select: { slug: true },
  })

  return result.docs
}

export const getTeamsByCompetition = async (competitionId: number | string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'teams',
    where: { competitions: { in: [competitionId] } },
    sort: 'name',
    limit: 100,
    depth: 1,
  })

  return result.docs as unknown as PopulatedTeam[]
}

export const getTeamBySlug = async (slug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'teams',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })

  return (result.docs[0] as unknown as PopulatedTeam) || null
}

export const getAllTeamSlugs = async () => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'teams',
    limit: 1000,
    depth: 0,
    select: { slug: true },
  })

  return result.docs
}

export const getPlayersByTeam = async (teamId: number | string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'players',
    where: { team: { equals: teamId } },
    sort: 'name',
    limit: 100,
    depth: 1,
  })

  return result.docs as unknown as PopulatedPlayer[]
}

export const getPlayerBySlug = async (slug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'players',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })

  return (result.docs[0] as unknown as PopulatedPlayer) || null
}

export const getAllPlayerSlugs = async () => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'players',
    limit: 1000,
    depth: 0,
    select: { slug: true },
  })

  return result.docs
}
