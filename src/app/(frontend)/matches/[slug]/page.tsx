import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { ArticleCard } from '@/components/ArticleCard'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MediaImage } from '@/components/MediaImage'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { Prose } from '@/components/ui/Prose'
import { Section } from '@/components/ui/Section'
import { getArticlesRelatedToMatch } from '@/lib/data'
import { getAllFootballMatchSlugs, getFootballMatchBySlug } from '@/lib/football'
import { getMatchMetadata, getSportsEventJsonLd } from '@/lib/seo'

export const revalidate = 60

export const generateStaticParams = async () => {
  try {
    const slugs = await getAllFootballMatchSlugs()
    return slugs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.error('Skipping match static params — database unavailable at build time:', error)
    return []
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const match = await getFootballMatchBySlug(slug)
  if (!match) return {}
  return getMatchMetadata(match, '/matches')
}

const formatKickoff = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const statusLabel: Record<string, string> = {
  scheduled: 'Scheduled',
  live: 'Live',
  finished: 'Full Time',
  postponed: 'Postponed',
  cancelled: 'Cancelled',
}

export default async function MatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const match = await getFootballMatchBySlug(slug)

  if (!match) notFound()

  const [relatedArticles, jsonLd] = await Promise.all([
    getArticlesRelatedToMatch(match.id, 3),
    Promise.resolve(getSportsEventJsonLd(match, '/matches')),
  ])

  const showScore = match.status === 'live' || match.status === 'finished'

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Matches', href: '/matches' },
          { label: `${match.homeTeam.name} vs ${match.awayTeam.name}`, href: `/matches/${match.slug}` },
        ]}
      />

      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between gap-2 text-sm">
          <Badge>{match.competition.name}</Badge>
          <span className={match.status === 'live' ? 'font-semibold text-accent-dark' : 'text-muted'}>
            {statusLabel[match.status]}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-lg border border-border bg-surface p-6">
          <div className="flex flex-col items-center gap-2 text-center">
            {match.homeTeam.logo && typeof match.homeTeam.logo === 'object' ? (
              <div className="h-16 w-16 overflow-hidden rounded-full bg-surface-alt">
                <MediaImage media={match.homeTeam.logo} priority />
              </div>
            ) : null}
            <span className="font-bold text-ink">{match.homeTeam.name}</span>
          </div>

          <div className="text-center">
            {showScore ? (
              <span className="text-3xl font-extrabold text-ink">
                {match.homeScore ?? 0} – {match.awayScore ?? 0}
              </span>
            ) : (
              <span className="text-lg font-bold text-muted">vs</span>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            {match.awayTeam.logo && typeof match.awayTeam.logo === 'object' ? (
              <div className="h-16 w-16 overflow-hidden rounded-full bg-surface-alt">
                <MediaImage media={match.awayTeam.logo} priority />
              </div>
            ) : null}
            <span className="font-bold text-ink">{match.awayTeam.name}</span>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted">Kickoff</dt>
            <dd className="font-semibold text-ink">{formatKickoff(match.kickoffTime)}</dd>
          </div>
          {match.venue ? (
            <div>
              <dt className="text-muted">Venue</dt>
              <dd className="font-semibold text-ink">{match.venue}</dd>
            </div>
          ) : null}
          {match.round ? (
            <div>
              <dt className="text-muted">Round</dt>
              <dd className="font-semibold text-ink">{match.round}</dd>
            </div>
          ) : null}
          {match.season ? (
            <div>
              <dt className="text-muted">Season</dt>
              <dd className="font-semibold text-ink">{match.season}</dd>
            </div>
          ) : null}
        </dl>

        {match.preview ? (
          <Prose className="mt-8">
            <RichText data={match.preview} />
          </Prose>
        ) : null}
      </div>

      {relatedArticles.length > 0 ? (
        <Section title="Related Articles">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </Section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Container>
  )
}
