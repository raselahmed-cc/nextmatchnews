import Link from 'next/link'

import { ArticleCard } from '@/components/ArticleCard'
import { HighlightCard } from '@/components/HighlightCard'
import { HomeFixtureCard } from '@/components/HomeFixtureCard'
import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { HorizontalScroller } from '@/components/ui/HorizontalScroller'
import { Section } from '@/components/ui/Section'
import { getPublishedArticles } from '@/lib/data'
import { getHomeLiveOrUpcoming, getHomeRecentResults } from '@/lib/homepage'
import { getRecentHighlights } from '@/lib/highlights'

export const revalidate = 60

const exploreLinks = [
  {
    title: 'Football',
    href: '/football',
    description: 'Premier League, Champions League, and more.',
    icon: (
      <path
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2.4 3.6 2.62-1.38 4.24H9.78L8.4 7.02 12 4.4ZM5.2 9.6l2.3-1.67 1.3 4-2.1 2.9-2.5-.8a7.9 7.9 0 0 1 1-4.43Zm1.2 8.36-.62-2.58 2.5-1.72h.02l2.02 2.78-1.4 2.5a7.96 7.96 0 0 1-2.52-.98Zm5.6 1.44a7.9 7.9 0 0 1-1.72-.19l1.32-2.35h2.8l1.34 2.36a7.9 7.9 0 0 1-1.74.18Zm3.86-1.62-1.42-2.5 2.02-2.78h.02l2.52 1.73-.62 2.57a7.96 7.96 0 0 1-2.52.98Zm3.14-6.38-2.5.8-2.1-2.9 1.3-4 2.3 1.67c.55 1.31.94 2.36 1 4.43Z"
        fill="currentColor"
      />
    ),
  },
  {
    title: 'NFL',
    href: '/nfl',
    description: 'Schedules, scores, and standings.',
    icon: (
      <path
        d="M3 12c0-3.6 2.2-6.8 5.3-8.3a15.6 15.6 0 0 1 7.4 0C18.8 5.2 21 8.4 21 12s-2.2 6.8-5.3 8.3a15.6 15.6 0 0 1-7.4 0C5.2 18.8 3 15.6 3 12Zm5.6-2.3 1 1 1-1M8.6 14.3l1 1 1-1M13.4 9.7l1 1 1-1M13.4 14.3l1 1 1-1M9 12h6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    title: 'Boxing',
    href: '/boxing',
    description: 'Fight cards, results, and rankings.',
    icon: (
      <path
        d="M6.5 8.5V7a2.5 2.5 0 0 1 5 0v.3a2.5 2.5 0 0 1 4 2v2.7c0 .9-.3 1.8-.9 2.5l-2.2 2.6a2 2 0 0 1-1.5.7H8a3 3 0 0 1-3-3v-1a2 2 0 0 1 1.5-1.94Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    title: 'How to Watch',
    href: '/how-to-watch',
    description: 'Streaming and broadcast guides.',
    icon: (
      <path
        d="M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 14.5v-9ZM8 20h8M12 16v4M10.5 7.7v4.6l4-2.3-4-2.3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
]

const formatDate = (value: string | null | undefined) => {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function HomePage() {
  const [{ docs: articles }, { fixtures: liveOrUpcoming, isLive }, recentResults, highlights] =
    await Promise.all([
      getPublishedArticles({ limit: 10 }),
      getHomeLiveOrUpcoming(8),
      getHomeRecentResults(6),
      getRecentHighlights(6),
    ])
  const [hero, ...remaining] = articles
  const topStories = remaining.slice(0, 3)
  const latestNews = remaining.slice(3)

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
          {/* Image and text are separate (not stacked) so a text-heavy
              placeholder cover graphic can never visually collide with the
              real headline — see the overlay version this replaced. Top
              Stories is its own row below, not a third flex sibling in the
              hero row — putting it inline forced the image and a
              variable-height text block to share one row height, and a
              short 16:9 image centered in a tall row left an obvious dead
              gap above and below it. As two independent rows, neither can
              impose a height mismatch on the other. */}
          <Link
            href={`/news/${hero.slug}`}
            className="group grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10"
          >
            <div className="aspect-[16/9] overflow-hidden rounded-xl bg-surface-alt ring-1 ring-white/10">
              <MediaImage
                media={hero.featuredImage}
                priority
                className="transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-col gap-4">
              <span className="inline-flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-accent">
                <span className="h-1 w-4 rounded-full bg-accent" aria-hidden="true" />
                {hero.category ? hero.category.name : 'Top Story'}
              </span>
              <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.5rem]">
                {hero.title}
              </h1>
              <p className="max-w-xl text-base text-white/70 sm:text-lg line-clamp-3">{hero.excerpt}</p>
              {hero.author ? (
                <span className="text-sm font-semibold text-white/60">By {hero.author.name}</span>
              ) : null}
            </div>
          </Link>

          {topStories.length > 0 ? (
            <div className="mt-10 border-t border-white/10 pt-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50">
                  More Top Stories
                </h2>
                <Link
                  href="/news"
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  Browse all news
                </Link>
              </div>
              <ul className="mt-5 grid gap-6 sm:grid-cols-3">
                {topStories.map((article, index) => (
                  <li key={article.id}>
                    <Link href={`/news/${article.slug}`} className="group flex items-start gap-3">
                      <span
                        className="font-display text-2xl font-bold leading-none text-white/20 transition-colors group-hover:text-accent"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="text-sm font-semibold leading-snug text-white transition-colors group-hover:text-accent">
                          {article.title}
                        </span>
                        <span className="text-xs text-white/50">
                          {[article.category?.name, formatDate(article.publishedAt)]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
          <HorizontalScroller className="pb-2">
            {liveOrUpcoming.map((fixture) => (
              <HomeFixtureCard key={fixture.id} fixture={fixture} variant="ticker" />
            ))}
          </HorizontalScroller>
        </Section>
      ) : null}

      {highlights.length > 0 || recentResults.length > 0 ? (
        <section className="bg-brand py-8 sm:py-12">
          <Container className="flex flex-col gap-10">
            {highlights.length > 0 ? (
              <div>
                <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                  <h2 className="inline-flex items-center gap-2 text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M6 4l10 6-10 6V4z" fill="currentColor" className="text-accent" />
                    </svg>
                    Video Highlights
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {highlights.map((highlight) => (
                    <HighlightCard key={highlight.id} highlight={highlight} />
                  ))}
                </div>
              </div>
            ) : null}

            {recentResults.length > 0 ? (
              <div>
                <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                  <h2 className="text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
                    Recent Results
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
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      {latestNews.length > 0 ? (
        <Section
          title="Latest News"
          action={
            <Link href="/news" className="text-sm font-semibold text-accent-dark hover:underline">
              View all
            </Link>
          }
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestNews.map((article) => (
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
              className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent-dark transition-colors group-hover:bg-accent group-hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  {link.icon}
                </svg>
              </span>
              <span className="font-display text-lg font-bold text-ink">{link.title}</span>
              <span className="text-sm text-muted">{link.description}</span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  )
}
