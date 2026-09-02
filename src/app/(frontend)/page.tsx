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
      {isLive ? (
        <div className="bg-accent">
          <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden="true" />
              {liveOrUpcoming.length} {liveOrUpcoming.length === 1 ? 'Match' : 'Matches'} Live Now
            </span>
            <Link
              href="/how-to-watch"
              className="rounded-md bg-white px-4 py-1.5 text-sm font-bold text-accent-dark transition-colors hover:bg-white/90"
            >
              Watch Live
            </Link>
          </Container>
        </div>
      ) : null}

      <section className="bg-brand">
        <Container className="py-8 sm:py-12">
          <Link href={`/news/${hero.slug}`} className="group grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
            {/* Image and text are separate (not stacked) so a text-heavy
                placeholder cover graphic can never visually collide with the
                real headline — see the overlay version this replaced. */}
            <div className="aspect-[16/9] overflow-hidden rounded-lg bg-surface-alt">
              <MediaImage
                media={hero.featuredImage}
                priority
                className="transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-col gap-3">
              {hero.category ? (
                <span className="inline-flex w-fit items-center rounded-full bg-accent px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {hero.category.name}
                </span>
              ) : null}
              <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                {hero.title}
              </h1>
              <p className="max-w-xl text-base text-white/80 sm:text-lg">{hero.excerpt}</p>
              {hero.author ? (
                <span className="text-sm font-semibold text-white/70">By {hero.author.name}</span>
              ) : null}
            </div>
          </Link>
        </Container>
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
