import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { getArticlesRelatedToNFLGame } from '@/lib/data'
import { getNFLGameBySlug } from '@/lib/nfl'
import { getSportsEventJsonLd } from '@/lib/seo'
import { ArticleCard } from './ArticleCard'
import { Breadcrumbs } from './Breadcrumbs'
import { MediaImage } from './MediaImage'
import { Badge } from './ui/Badge'
import { Container } from './ui/Container'
import { Prose } from './ui/Prose'
import { Section } from './ui/Section'

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
  finished: 'Final',
  postponed: 'Postponed',
  cancelled: 'Cancelled',
}

// Shared by the NFL and NCAA Football game-detail pages — see the note in
// AmericanFootballSportHub.tsx. `sportSlug` is a safeguard, not just routing:
// since both sports share the `nfl-games` collection, a game belonging to the
// other sport must 404 here rather than silently render at the wrong URL.
export const AmericanFootballGamePage = async ({
  slug,
  sportSlug,
  sportLabel,
  sportHref,
  basePath,
}: {
  slug: string
  sportSlug: string
  sportLabel: string
  sportHref: string
  basePath: string
}) => {
  const game = await getNFLGameBySlug(slug)

  if (!game || game.competition.sport.slug !== sportSlug) notFound()

  const [relatedArticles, jsonLd] = await Promise.all([
    getArticlesRelatedToNFLGame(game.id, 3),
    Promise.resolve(getSportsEventJsonLd(game, basePath)),
  ])

  const showScore = game.status === 'live' || game.status === 'finished'

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: sportLabel, href: sportHref },
          { label: `${game.homeTeam.name} vs ${game.awayTeam.name}`, href: `${basePath}/${game.slug}` },
        ]}
      />

      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between gap-2 text-sm">
          <Badge>{game.competition.name}</Badge>
          <span className={game.status === 'live' ? 'font-semibold text-accent-dark' : 'text-muted'}>
            {statusLabel[game.status]}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-lg border border-border bg-surface p-6">
          <div className="flex flex-col items-center gap-2 text-center">
            {game.homeTeam.logo && typeof game.homeTeam.logo === 'object' ? (
              <div className="h-16 w-16 overflow-hidden rounded-full bg-surface-alt">
                <MediaImage media={game.homeTeam.logo} priority />
              </div>
            ) : null}
            <span className="font-bold text-ink">{game.homeTeam.name}</span>
          </div>

          <div className="text-center">
            {showScore ? (
              <span className="text-3xl font-extrabold text-ink">
                {game.homeScore ?? 0} – {game.awayScore ?? 0}
              </span>
            ) : (
              <span className="text-lg font-bold text-muted">vs</span>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            {game.awayTeam.logo && typeof game.awayTeam.logo === 'object' ? (
              <div className="h-16 w-16 overflow-hidden rounded-full bg-surface-alt">
                <MediaImage media={game.awayTeam.logo} priority />
              </div>
            ) : null}
            <span className="font-bold text-ink">{game.awayTeam.name}</span>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted">Kickoff</dt>
            <dd className="font-semibold text-ink">{formatKickoff(game.kickoffTime)}</dd>
          </div>
          {game.venue ? (
            <div>
              <dt className="text-muted">Venue</dt>
              <dd className="font-semibold text-ink">{game.venue}</dd>
            </div>
          ) : null}
          {game.week ? (
            <div>
              <dt className="text-muted">Week</dt>
              <dd className="font-semibold text-ink">{game.week}</dd>
            </div>
          ) : null}
          {game.season ? (
            <div>
              <dt className="text-muted">Season</dt>
              <dd className="font-semibold text-ink">{game.season}</dd>
            </div>
          ) : null}
        </dl>

        {game.preview ? (
          <Prose className="mt-8">
            <RichText data={game.preview} />
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
