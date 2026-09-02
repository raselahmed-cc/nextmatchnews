import type { Metadata } from 'next'
import Link from 'next/link'

import { ArticleCard } from '@/components/ArticleCard'
import { CompetitionCard } from '@/components/CompetitionCard'
import { HighlightCard } from '@/components/HighlightCard'
import { MatchCard } from '@/components/MatchCard'
import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { getCategoryBySlug, getPublishedArticles } from '@/lib/data'
import { getFootballMatches } from '@/lib/football'
import { getHighlightsBySport } from '@/lib/highlights'
import { getWatchGuideHrefForSport } from '@/lib/howToWatch'
import { getCompetitionsBySport, getSportBySlug } from '@/lib/sports'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Football',
  description: 'Football competitions, teams, fixtures, and news.',
  alternates: { canonical: '/football' },
}

const ViewAllLink = ({ href }: { href: string }) => (
  <Link href={href} className="text-sm font-semibold text-accent-dark hover:underline">
    View all
  </Link>
)

export default async function FootballPage() {
  const sport = await getSportBySlug('football')

  if (!sport) {
    return (
      <Container className="flex flex-col items-start gap-3 py-20">
        <h1 className="text-3xl font-extrabold text-ink">Football coverage is being set up</h1>
        <p className="max-w-lg text-muted">
          Once competitions and matches are added in the admin panel, they&apos;ll appear here.
        </p>
        <Link href="/admin" className="font-semibold text-accent-dark hover:underline">
          Go to admin panel
        </Link>
      </Container>
    )
  }

  const footballCategory = await getCategoryBySlug('football')

  const [competitions, { docs: upcomingMatches }, highlights, { docs: articles }, watchHref] = await Promise.all([
    getCompetitionsBySport(sport.id),
    getFootballMatches({ upcomingOnly: true, limit: 6 }),
    getHighlightsBySport('football', 6),
    footballCategory
      ? getPublishedArticles({ categoryId: footballCategory.id, limit: 6 })
      : Promise.resolve({ docs: [] }),
    getWatchGuideHrefForSport('football'),
  ])

  const icon = sport.icon && typeof sport.icon === 'object' ? sport.icon : null

  return (
    <>
      <section className="relative overflow-hidden bg-brand">
        {icon ? (
          <div className="absolute inset-0">
            <MediaImage media={icon} className="opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/85 to-brand/60" />
          </div>
        ) : null}
        <Container className="relative flex flex-col gap-2 py-12 sm:py-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Sport Hub</span>
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-white sm:text-5xl">
            {sport.name}
          </h1>
          {sport.description ? (
            <p className="max-w-xl text-base text-white/75 sm:text-lg">{sport.description}</p>
          ) : null}
        </Container>
      </section>

      {upcomingMatches.length > 0 ? (
        <Section title="Upcoming Matches" action={<ViewAllLink href="/matches" />}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} watchHref={watchHref} />
            ))}
          </div>
        </Section>
      ) : null}

      {highlights.length > 0 ? (
        <section className="bg-brand py-8 sm:py-12">
          <Container>
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-3">
              <h2 className="text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">Highlights</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((highlight) => (
                <HighlightCard key={highlight.id} highlight={highlight} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {articles.length > 0 ? (
        <Section
          title="Latest News"
          action={footballCategory ? <ViewAllLink href={`/categories/${footballCategory.slug}`} /> : undefined}
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="Competitions" className="bg-surface-alt">
        {competitions.length === 0 ? (
          <p className="text-muted">No competitions added yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {competitions.map((competition) => (
              <CompetitionCard key={competition.id} competition={competition} />
            ))}
          </div>
        )}
      </Section>
    </>
  )
}
