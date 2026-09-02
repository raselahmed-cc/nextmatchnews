import Link from 'next/link'

import { ArticleCard } from '@/components/ArticleCard'
import { HomeFixtureCard } from '@/components/HomeFixtureCard'
import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { getPublishedArticles } from '@/lib/data'
import { getHomeLiveOrUpcoming, getHomeRecentResults } from '@/lib/homepage'

export const revalidate = 60

const exploreLinks = [
  {
    title: 'Football',
    href: '/football',
    description: 'Premier League, Champions League, and more.',
  },
  { title: 'NFL', href: '/nfl', description: 'Schedules, scores, and standings.' },
  { title: 'Boxing', href: '/boxing', description: 'Fight cards, results, and rankings.' },
  { title: 'How to Watch', href: '/how-to-watch', description: 'Streaming and broadcast guides.' },
]

export default async function HomePage() {
  const [{ docs: articles }, { fixtures: liveOrUpcoming, isLive }, recentResults] = await Promise.all([
    getPublishedArticles({ limit: 7 }),
    getHomeLiveOrUpcoming(8),
    getHomeRecentResults(6),
  ])
  const [hero, ...rest] = articles

  if (!hero) {
    return (
      <Container className="flex flex-col items-start gap-3 py-20">
        <h1 className="text-3xl font-extrabold text-ink">No articles published yet</h1>
        <p className="max-w-lg text-muted">
          Once you publish your first article in the admin panel, it will appear here.
        </p>
        <Link href="/admin" className="font-semibold text-accent-dark hover:underline">
          Go to admin panel
        </Link>
      </Container>
    )
  }

  return (
    <>
      <section className="relative bg-brand">
        <Link href={`/news/${hero.slug}`} className="group relative block aspect-[16/9] sm:aspect-[21/9]">
          <MediaImage
            media={hero.featuredImage}
            priority
            className="opacity-70 transition-opacity duration-200 group-hover:opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <Container className="flex flex-col gap-3 pb-8 pt-16 sm:pb-12">
              {hero.category ? (
                <span className="inline-flex w-fit items-center rounded-full bg-accent px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {hero.category.name}
                </span>
              ) : null}
              <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                {hero.title}
              </h1>
              <p className="max-w-2xl text-base text-white/80 sm:text-lg">{hero.excerpt}</p>
              {hero.author ? (
                <span className="text-sm font-semibold text-white/70">By {hero.author.name}</span>
              ) : null}
            </Container>
          </div>
        </Link>
      </section>

      {liveOrUpcoming.length > 0 ? (
        <Section
          title={
            isLive ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden="true" />
                Live Now
              </span>
            ) : (
              'Upcoming Matches'
            )
          }
          action={
            <Link href="/matches" className="text-sm font-semibold text-accent-dark hover:underline">
              View all
            </Link>
          }
        >
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {liveOrUpcoming.map((fixture) => (
              <HomeFixtureCard key={fixture.id} fixture={fixture} variant="ticker" />
            ))}
          </div>
        </Section>
      ) : null}

      {recentResults.length > 0 ? (
        <section className="bg-brand py-8 sm:py-12">
          <Container>
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-3">
              <h2 className="text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
                Highlights
              </h2>
              <Link href="/matches" className="text-sm font-semibold text-accent hover:underline">
                View all
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentResults.map((fixture) => (
                <HomeFixtureCard key={fixture.id} fixture={fixture} variant="result" />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {rest.length > 0 ? (
        <Section
          title="Latest News"
          action={
            <Link href="/news" className="text-sm font-semibold text-accent-dark hover:underline">
              View all
            </Link>
          }
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="Explore" className="bg-surface-alt">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {exploreLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <span className="font-display text-lg font-bold text-ink">{link.title}</span>
              <span className="text-sm text-muted">{link.description}</span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  )
}
