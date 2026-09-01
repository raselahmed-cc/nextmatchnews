import type { Where } from 'payload'

import type { AffiliateProvider, Competition, HowToWatchGuide, Media, Sport } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { getSportBySlug } from '@/lib/sports'

export type PopulatedHowToWatchGuide = Omit<
  HowToWatchGuide,
  'sport' | 'competition' | 'streamingOptions' | 'featuredImage' | 'ogImage'
> & {
  sport?: Sport | null
  competition?: Competition | null
  streamingOptions: { provider: AffiliateProvider; note?: string | null; id?: string | null }[]
  featuredImage: Media
  ogImage?: Media | null
}

export const getGuides = async ({
  limit = 20,
  page = 1,
  sportSlug,
  featured,
}: {
  limit?: number
  page?: number
  sportSlug?: string
  featured?: boolean
} = {}) => {
  const payload = await getPayloadClient()
  const where: Where = {}

  if (sportSlug) {
    const sport = await getSportBySlug(sportSlug)
    where.sport = { equals: sport ? sport.id : -1 }
  }
  if (featured !== undefined) where.featured = { equals: featured }

  const result = await payload.find({
    collection: 'how-to-watch-guides',
    where,
    sort: '-publishedAt',
    limit,
    page,
    depth: 2,
  })

  return {
    ...result,
    docs: result.docs as unknown as PopulatedHowToWatchGuide[],
  }
}

export const getGuideBySlug = async (slug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'how-to-watch-guides',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })

  return (result.docs[0] as unknown as PopulatedHowToWatchGuide) || null
}

export const getAllPublishedGuideSlugs = async () => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'how-to-watch-guides',
    limit: 1000,
    depth: 0,
    select: { slug: true, updatedAt: true },
  })

  return result.docs
}

export const getRelatedGuides = async (currentId: number, sportId: number | null | undefined, limit = 3) => {
  const payload = await getPayloadClient()
  const where: Where = { id: { not_equals: currentId } }

  if (sportId) where.sport = { equals: sportId }

  const result = await payload.find({
    collection: 'how-to-watch-guides',
    where,
    sort: '-publishedAt',
    limit,
    depth: 1,
  })

  return result.docs as unknown as PopulatedHowToWatchGuide[]
}
