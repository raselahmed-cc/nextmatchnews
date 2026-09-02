import type { Where } from 'payload'

import type { Fight, FightEvent, Fighter, Sport } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { getSportBySlug } from '@/lib/sports'

export type PopulatedFighter = Omit<Fighter, 'sport'> & { sport: Sport }
export type PopulatedFightEvent = Omit<FightEvent, 'sport'> & { sport: Sport }
export type PopulatedFight = Omit<Fight, 'event' | 'fighterA' | 'fighterB' | 'winner'> & {
  event: PopulatedFightEvent
  fighterA: Fighter
  fighterB: Fighter
  winner?: Fighter | null
}

// FightEvents carry `sport` directly (unlike matches/games, which derive it
// through a Competition) — Boxing has no leagues/competitions to route
// through, so there's no indirection needed here.
export const getFightEvents = async ({
  limit = 20,
  page = 1,
  sportSlug,
  status,
  upcomingOnly,
}: {
  limit?: number
  page?: number
  sportSlug?: string
  status?: FightEvent['status']
  upcomingOnly?: boolean
} = {}) => {
  const payload = await getPayloadClient()
  const where: Where = {}

  if (sportSlug) {
    const sport = await getSportBySlug(sportSlug)
    where.sport = { equals: sport ? sport.id : -1 }
  }
  if (status) where.status = { equals: status }
  if (upcomingOnly) where.date = { greater_than_equal: new Date().toISOString() }

  const result = await payload.find({
    collection: 'fight-events',
    where,
    sort: upcomingOnly ? 'date' : '-date',
    limit,
    page,
    depth: 1,
  })

  return {
    ...result,
    docs: result.docs as unknown as PopulatedFightEvent[],
  }
}

export const getFightEventBySlug = async (slug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'fight-events',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })

  return (result.docs[0] as unknown as PopulatedFightEvent) || null
}

export const getAllFightEventSlugs = async (sportSlug?: string) => {
  const payload = await getPayloadClient()
  const where: Where = {}

  if (sportSlug) {
    const sport = await getSportBySlug(sportSlug)
    where.sport = { equals: sport ? sport.id : -1 }
  }

  const result = await payload.find({
    collection: 'fight-events',
    where,
    limit: 1000,
    depth: 0,
    select: { slug: true, updatedAt: true },
  })

  return result.docs
}

export const getFights = async ({
  limit = 20,
  page = 1,
  eventId,
  fighterId,
  sportSlug,
  status,
}: {
  limit?: number
  page?: number
  eventId?: number | string
  fighterId?: number | string
  // `fights` has no sport field of its own — it inherits sport through its
  // event (`event.sport`). Needed whenever fights are being aggregated
  // across events (e.g. the homepage), since this collection also holds
  // non-boxing combat sports (UFC/MMA) and an unscoped query would blend
  // them together.
  sportSlug?: string
  status?: Fight['status']
} = {}) => {
  const payload = await getPayloadClient()
  const where: Where = {}

  if (eventId) where.event = { equals: eventId }
  if (status) where.status = { equals: status }
  if (fighterId) {
    where.or = [{ fighterA: { equals: fighterId } }, { fighterB: { equals: fighterId } }]
  }
  if (sportSlug) {
    const sport = await getSportBySlug(sportSlug)
    where['event.sport'] = { equals: sport ? sport.id : -1 }
  }

  const result = await payload.find({
    collection: 'fights',
    where,
    sort: '-createdAt',
    limit,
    page,
    depth: 2,
  })

  return {
    ...result,
    docs: result.docs as unknown as PopulatedFight[],
  }
}

export const getFightBySlug = async (slug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'fights',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })

  return (result.docs[0] as unknown as PopulatedFight) || null
}

// For generateStaticParams / sitemap — scoped to one sport so a fight is
// never prerendered under the wrong sport's URL (same reasoning as
// getAllNFLGameSlugsForSport in src/lib/nfl.ts).
export const getAllFightSlugsForSport = async (sportSlug: string) => {
  const sport = await getSportBySlug(sportSlug)
  const payload = await getPayloadClient()

  const eventIds: (number | string)[] = sport
    ? (
        await payload.find({
          collection: 'fight-events',
          where: { sport: { equals: sport.id } },
          limit: 1000,
          depth: 0,
        })
      ).docs.map((doc) => doc.id)
    : []

  const result = await payload.find({
    collection: 'fights',
    where: { event: { in: eventIds.length > 0 ? eventIds : [-1] } },
    limit: 1000,
    depth: 0,
    select: { slug: true, updatedAt: true },
  })

  return result.docs
}

export const getFightersBySport = async (sportSlug: string, limit = 20) => {
  const sport = await getSportBySlug(sportSlug)
  if (!sport) return []

  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'fighters',
    where: { sport: { equals: sport.id } },
    sort: '-wins',
    limit,
    depth: 1,
  })

  return result.docs as unknown as PopulatedFighter[]
}

export const getFighterBySlug = async (slug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'fighters',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })

  return (result.docs[0] as unknown as PopulatedFighter) || null
}

export const getAllFighterSlugs = async () => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'fighters',
    limit: 1000,
    depth: 0,
    select: { slug: true },
  })

  return result.docs
}
