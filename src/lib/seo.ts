import type { Metadata } from 'next'

import type { Article, HowToWatchGuide, Media, Team } from '@/payload-types'

type MediaRef = Media | number | string | null | undefined

export const siteConfig = {
  name: 'NextMatchNews',
  description:
    'Football, NFL, and boxing news, match information, and how-to-watch guides.',
  defaultTitle: 'NextMatchNews — Football, NFL & Boxing News',
}

export const getServerSideURL = (): string => {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
}

const isMedia = (value: MediaRef): value is Media =>
  typeof value === 'object' && value !== null && 'url' in value

export const getMediaURL = (media: MediaRef): string | undefined => {
  if (!isMedia(media)) return undefined
  if (!media.url) return undefined
  return media.url.startsWith('http') ? media.url : `${getServerSideURL()}${media.url}`
}

type ArticleMetadataInput = Pick<
  Article,
  'title' | 'excerpt' | 'slug' | 'seoTitle' | 'seoDescription' | 'canonicalURL' | 'featuredImage' | 'ogImage'
>

export const getArticleMetadata = (article: ArticleMetadataInput): Metadata => {
  const title = article.seoTitle || article.title
  const description = article.seoDescription || article.excerpt
  const canonical = article.canonicalURL || `${getServerSideURL()}/news/${article.slug}`
  const image = getMediaURL(article.ogImage) || getMediaURL(article.featuredImage)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: 'article',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

type GuideMetadataInput = Pick<
  HowToWatchGuide,
  'title' | 'excerpt' | 'slug' | 'seoTitle' | 'seoDescription' | 'canonicalURL' | 'featuredImage' | 'ogImage'
>

export const getHowToWatchGuideMetadata = (guide: GuideMetadataInput): Metadata => {
  const title = guide.seoTitle || guide.title
  const description = guide.seoDescription || guide.excerpt
  const canonical = guide.canonicalURL || `${getServerSideURL()}/how-to-watch/${guide.slug}`
  const image = getMediaURL(guide.ogImage) || getMediaURL(guide.featuredImage)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: 'article',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

// Article, not a fabricated review/rating type — CLAUDE.md §21 bans
// inventing ratings, scores, or reviews that don't exist on the page.
type GuideJsonLdInput = Pick<HowToWatchGuide, 'title' | 'excerpt' | 'slug' | 'publishedAt' | 'updatedAt' | 'featuredImage'>

export const getHowToWatchGuideJsonLd = (guide: GuideJsonLdInput) => {
  const url = `${getServerSideURL()}/how-to-watch/${guide.slug}`
  const image = getMediaURL(guide.featuredImage)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.excerpt,
    mainEntityOfPage: url,
    url,
    image: image ? [image] : undefined,
    datePublished: guide.publishedAt || undefined,
    dateModified: guide.updatedAt || guide.publishedAt || undefined,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: getServerSideURL(),
    },
  }
}

type NewsArticleJsonLdInput = Pick<
  Article,
  'title' | 'excerpt' | 'slug' | 'publishedAt' | 'updatedAt' | 'featuredImage'
> & {
  author: { name: string } | null | undefined
}

export const getNewsArticleJsonLd = (article: NewsArticleJsonLdInput) => {
  const url = `${getServerSideURL()}/news/${article.slug}`
  const image = getMediaURL(article.featuredImage)

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    mainEntityOfPage: url,
    url,
    image: image ? [image] : undefined,
    datePublished: article.publishedAt || undefined,
    dateModified: article.updatedAt || article.publishedAt || undefined,
    author: article.author
      ? {
          '@type': 'Person',
          name: article.author.name,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: getServerSideURL(),
    },
  }
}

// Shared by any team-sport event collection (FootballMatches, NFLGames, ...) —
// they're structurally identical for these fields even though they're kept as
// separate Payload collections (see src/collections/NFLGames.ts for why).
type SportsEventStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'

type SportsEventInput = {
  slug: string
  kickoffTime: string
  venue?: string | null
  status: SportsEventStatus
  homeTeam: Team
  awayTeam: Team
  competition: { name: string }
}

export const getMatchMetadata = (event: SportsEventInput, basePath: string): Metadata => {
  const title = `${event.homeTeam.name} vs ${event.awayTeam.name}`
  const description = `${title} — ${event.competition.name}${
    event.venue ? ` at ${event.venue}` : ''
  }. Kickoff, teams, score, and match preview on ${siteConfig.name}.`
  const canonical = `${getServerSideURL()}${basePath}/${event.slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: 'website',
    },
  }
}

const eventStatusMap: Record<SportsEventStatus, string> = {
  scheduled: 'https://schema.org/EventScheduled',
  live: 'https://schema.org/EventScheduled',
  finished: 'https://schema.org/EventScheduled',
  postponed: 'https://schema.org/EventPostponed',
  cancelled: 'https://schema.org/EventCancelled',
}

export const getSportsEventJsonLd = (event: SportsEventInput, basePath: string) => {
  const url = `${getServerSideURL()}${basePath}/${event.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${event.homeTeam.name} vs ${event.awayTeam.name}`,
    url,
    startDate: event.kickoffTime,
    eventStatus: eventStatusMap[event.status],
    location: event.venue
      ? {
          '@type': 'Place',
          name: event.venue,
        }
      : undefined,
    homeTeam: {
      '@type': 'SportsTeam',
      name: event.homeTeam.name,
    },
    awayTeam: {
      '@type': 'SportsTeam',
      name: event.awayTeam.name,
    },
  }
}

// Boxing fights aren't team-vs-team, so they don't fit SportsEventInput above
// (a fighter is a Person, not a SportsTeam, and the date/venue live on the
// Fight's related Event rather than on the fight itself).
type FightInput = {
  slug: string
  fighterA: { name: string }
  fighterB: { name: string }
  status: SportsEventStatus
  event: { name: string; date: string; venue?: string | null }
}

export const getFightMetadata = (fight: FightInput, basePath: string): Metadata => {
  const title = `${fight.fighterA.name} vs ${fight.fighterB.name}`
  const description = `${title} — ${fight.event.name}${
    fight.event.venue ? ` at ${fight.event.venue}` : ''
  }. Fight card, weight class, and preview on ${siteConfig.name}.`
  const canonical = `${getServerSideURL()}${basePath}/${fight.slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: 'website',
    },
  }
}

export const getFightJsonLd = (fight: FightInput, basePath: string) => {
  const url = `${getServerSideURL()}${basePath}/${fight.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${fight.fighterA.name} vs ${fight.fighterB.name}`,
    url,
    startDate: fight.event.date,
    eventStatus: eventStatusMap[fight.status],
    location: fight.event.venue
      ? {
          '@type': 'Place',
          name: fight.event.venue,
        }
      : undefined,
    competitor: [
      { '@type': 'Person', name: fight.fighterA.name },
      { '@type': 'Person', name: fight.fighterB.name },
    ],
  }
}
