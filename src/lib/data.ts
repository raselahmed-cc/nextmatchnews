import type { Where } from 'payload'

import type { Article, Author, Category, Media, Tag } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export type PopulatedArticle = Omit<
  Article,
  'author' | 'category' | 'tags' | 'featuredImage' | 'ogImage'
> & {
  author: Author
  category: Category
  tags: Tag[] | null
  featuredImage: Media
  ogImage?: Media | null
}

const PUBLISHED = {
  _status: {
    equals: 'published',
  },
} as const

export const getPublishedArticles = async ({
  limit = 12,
  page = 1,
  categoryId,
  authorId,
  tagId,
}: {
  limit?: number
  page?: number
  categoryId?: number | string
  authorId?: number | string
  tagId?: number | string
} = {}) => {
  const payload = await getPayloadClient()

  const where: Where = { ...PUBLISHED }
  if (categoryId) where.category = { equals: categoryId }
  if (authorId) where.author = { equals: authorId }
  if (tagId) where.tags = { in: [tagId] }

  const result = await payload.find({
    collection: 'articles',
    where,
    sort: '-publishedAt',
    limit,
    page,
    depth: 2,
  })

  return {
    ...result,
    docs: result.docs as unknown as PopulatedArticle[],
  }
}

export const getArticleBySlug = async (slug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'articles',
    where: {
      ...PUBLISHED,
      slug: { equals: slug },
    },
    depth: 2,
    limit: 1,
  })

  return (result.docs[0] as unknown as PopulatedArticle) || null
}

export const getRelatedArticles = async (
  categoryId: number | string,
  excludeId: number | string,
  limit = 3,
) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'articles',
    where: {
      ...PUBLISHED,
      category: { equals: categoryId },
      id: { not_equals: excludeId },
    },
    sort: '-publishedAt',
    limit,
    depth: 2,
  })

  return result.docs as unknown as PopulatedArticle[]
}

export const getArticlesRelatedToMatch = async (matchId: number | string, limit = 3) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'articles',
    where: {
      ...PUBLISHED,
      relatedMatch: { equals: matchId },
    },
    sort: '-publishedAt',
    limit,
    depth: 2,
  })

  return result.docs as unknown as PopulatedArticle[]
}

export const getArticlesRelatedToNFLGame = async (gameId: number | string, limit = 3) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'articles',
    where: {
      ...PUBLISHED,
      relatedNFLGame: { equals: gameId },
    },
    sort: '-publishedAt',
    limit,
    depth: 2,
  })

  return result.docs as unknown as PopulatedArticle[]
}

export const getArticlesRelatedToFight = async (fightId: number | string, limit = 3) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'articles',
    where: {
      ...PUBLISHED,
      relatedFight: { equals: fightId },
    },
    sort: '-publishedAt',
    limit,
    depth: 2,
  })

  return result.docs as unknown as PopulatedArticle[]
}

export const getAuthorBySlug = async (slug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'authors',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })

  return result.docs[0] || null
}

export const getCategoryBySlug = async (slug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  return result.docs[0] || null
}

export const getAllPublishedArticleSlugs = async () => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'articles',
    where: PUBLISHED,
    limit: 1000,
    depth: 0,
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  return result.docs
}

export const getAllAuthorSlugs = async () => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'authors',
    limit: 1000,
    depth: 0,
    select: {
      slug: true,
    },
  })

  return result.docs
}

export const getAllCategorySlugs = async () => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'categories',
    limit: 1000,
    depth: 0,
    select: {
      slug: true,
    },
  })

  return result.docs
}
