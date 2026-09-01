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
import { getAllFightSlugsForSport, getFightBySlug } from '@/lib/boxing'
import { getArticlesRelatedToFight } from '@/lib/data'
import { getFightJsonLd, getFightMetadata } from '@/lib/seo'

export const revalidate = 60

export const generateStaticParams = async () => {
  try {
    const slugs = await getAllFightSlugsForSport('boxing')
    return slugs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.error('Skipping boxing fight static params — database unavailable at build time:', error)
    return []
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const fight = await getFightBySlug(slug)
  if (!fight) return {}
  return getFightMetadata(fight, '/boxing/fights')
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

const statusLabel: Record<string, string> = {
  scheduled: 'Scheduled',
  live: 'Live',
  finished: 'Final',
  postponed: 'Postponed',
  cancelled: 'Cancelled',
}

const methodLabel: Record<string, string> = {
  ko: 'KO',
  tko: 'TKO',
  'decision-unanimous': 'Unanimous Decision',
  'decision-split': 'Split Decision',
  'decision-majority': 'Majority Decision',
  submission: 'Submission',
  draw: 'Draw',
  'no-contest': 'No Contest',
  disqualification: 'Disqualification',
}

export default async function BoxingFightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const fight = await getFightBySlug(slug)

  if (!fight) notFound()

  const [relatedArticles, jsonLd] = await Promise.all([
    getArticlesRelatedToFight(fight.id, 3),
    Promise.resolve(getFightJsonLd(fight, '/boxing/fights')),
  ])

  const winnerId = typeof fight.winner === 'object' ? fight.winner?.id : fight.winner
  const isFinished = fight.status === 'finished'

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Boxing', href: '/boxing' },
          { label: fight.event.name, href: `/boxing/events/${fight.event.slug}` },
          {
            label: `${fight.fighterA.name} vs ${fight.fighterB.name}`,
            href: `/boxing/fights/${fight.slug}`,
          },
        ]}
      />

      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between gap-2 text-sm">
          {fight.weightClass ? <Badge>{fight.weightClass}</Badge> : <span />}
          <span className={fight.status === 'live' ? 'font-semibold text-accent-dark' : 'text-muted'}>
            {statusLabel[fight.status]}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-lg border border-border bg-surface p-6">
          <div className="flex flex-col items-center gap-2 text-center">
            {fight.fighterA.photo && typeof fight.fighterA.photo === 'object' ? (
              <div className="h-16 w-16 overflow-hidden rounded-full bg-surface-alt">
                <MediaImage media={fight.fighterA.photo} priority />
              </div>
            ) : null}
            <span className="font-bold text-ink">
              {fight.fighterA.name}
              {isFinished && fight.fighterA.id === winnerId ? ' (W)' : ''}
            </span>
          </div>

          <span className="text-lg font-bold text-muted">vs</span>

          <div className="flex flex-col items-center gap-2 text-center">
            {fight.fighterB.photo && typeof fight.fighterB.photo === 'object' ? (
              <div className="h-16 w-16 overflow-hidden rounded-full bg-surface-alt">
                <MediaImage media={fight.fighterB.photo} priority />
              </div>
            ) : null}
            <span className="font-bold text-ink">
              {fight.fighterB.name}
              {isFinished && fight.fighterB.id === winnerId ? ' (W)' : ''}
            </span>
          </div>
        </div>

        {isFinished && fight.method ? (
          <p className="mt-4 text-center font-semibold text-ink">
            {methodLabel[fight.method] || fight.method}
          </p>
        ) : null}

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted">Event</dt>
            <dd className="font-semibold text-ink">{fight.event.name}</dd>
          </div>
          <div>
            <dt className="text-muted">Date</dt>
            <dd className="font-semibold text-ink">{formatDate(fight.event.date)}</dd>
          </div>
          {fight.event.venue ? (
            <div>
              <dt className="text-muted">Venue</dt>
              <dd className="font-semibold text-ink">{fight.event.venue}</dd>
            </div>
          ) : null}
          {fight.scheduledRounds ? (
            <div>
              <dt className="text-muted">Scheduled Rounds</dt>
              <dd className="font-semibold text-ink">{fight.scheduledRounds}</dd>
            </div>
          ) : null}
          {fight.titles ? (
            <div className="col-span-2 sm:col-span-4">
              <dt className="text-muted">Title(s)</dt>
              <dd className="font-semibold text-ink">{fight.titles}</dd>
            </div>
          ) : null}
        </dl>

        {fight.preview ? (
          <Prose className="mt-8">
            <RichText data={fight.preview} />
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
