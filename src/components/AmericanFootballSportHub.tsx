import Link from 'next/link'

import { getCategoryBySlug, getPublishedArticles } from '@/lib/data'
import { getHighlightsBySport } from '@/lib/highlights'
import { getWatchGuideHrefForSport } from '@/lib/howToWatch'
import { getNFLGamesForSport } from '@/lib/nfl'
import { getCompetitionsBySport, getSportBySlug } from '@/lib/sports'
import { ArticleCard } from './ArticleCard'
import { CompetitionCard } from './CompetitionCard'
import { HighlightCard } from './HighlightCard'
import { MatchCard } from './MatchCard'
import { MediaImage } from './MediaImage'
import { Container } from './ui/Container'
import { Section } from './ui/Section'

const ViewAllLink = ({ href }: { href: string }) => (
  <Link href={href} className="text-sm font-semibold text-accent-dark hover:underline">
    View all
  </Link>
)

// Shared hub-page shape for any sport that lives in the `nfl-games`
// collection (currently NFL and NCAA Football — same game shape, different
// competition tiers). Not a generic "any sport" hub: Football (soccer) has
// its own collection/lib and its own page, since the two aren't
// interchangeable — see src/lib/football.ts vs src/lib/nfl.ts. Mirrors the
// premium hero/highlights/news layout built for src/app/(frontend)/football/page.tsx.
export const AmericanFootballSportHub = async ({
  sportSlug,
  categorySlug,
  title,
  gamesIndexHref,
  gamesBasePath,
}: {
  sportSlug: string
  categorySlug: string
  title: string
  gamesIndexHref: string
  gamesBasePath: string
}) => {
  const sport = await getSportBySlug(sportSlug)

  if (!sport) {
    return (
      <Container className="flex flex-col items-start gap-3 py-20">
        <h1 className="text-3xl font-extrabold text-ink">{title} coverage is being set up</h1>
        <p className="max-w-lg text-muted">
          Once competitions and games are added in the admin panel, they&apos;ll appear here.
        </p>
        <Link href="/admin" className="font-semibold text-accent-dark hover:underline">
          Go to admin panel
        </Link>
      </Container>
    )
  }

  const category = await getCategoryBySlug(categorySlug)

  const [competitions, { docs: upcomingGames }, highlights, { docs: articles }, watchHref] = await Promise.all([
    getCompetitionsBySport(sport.id),
    getNFLGamesForSport(sportSlug, { upcomingOnly: true, limit: 6 }),
    getHighlightsBySport(sportSlug, 6),
    category ? getPublishedArticles({ categoryId: category.id, limit: 6 }) : Promise.resolve({ docs: [] }),
    getWatchGuideHrefForSport(sportSlug),
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
            {title}
          </h1>
          {sport.description ? (
            <p className="max-w-xl text-base text-white/75 sm:text-lg">{sport.description}</p>
          ) : null}
        </Container>
      </section>

      {upcomingGames.length > 0 ? (
        <Section title="Upcoming Games" action={<ViewAllLink href={gamesIndexHref} />}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingGames.map((game) => (
              <MatchCard key={game.id} match={game} basePath={gamesBasePath} watchHref={watchHref} />
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
          action={category ? <ViewAllLink href={`/categories/${category.slug}`} /> : undefined}
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
