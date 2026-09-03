import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Team } from '@/payload-types'
import { getArticlesRelatedToNFLGame } from '@/lib/data'
import { fromNFLGame } from '@/lib/homepage'
import { getWatchGuideHrefForSport } from '@/lib/howToWatch'
import { getHeadToHeadGames, getNFLGameBySlug, getOtherGamesInWeek } from '@/lib/nfl'
import { getSportsEventJsonLd } from '@/lib/seo'
import { ArticleCard } from './ArticleCard'
import { Breadcrumbs } from './Breadcrumbs'
import { HomeFixtureCard } from './HomeFixtureCard'
import { MediaImage } from './MediaImage'
import { Button } from './ui/Button'
import { Container } from './ui/Container'
import { HorizontalScroller } from './ui/HorizontalScroller'
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

const TeamBlock = ({ team, align }: { team: Team; align: 'left' | 'right' }) => (
  <div
    className={`flex items-center gap-4 ${align === 'right' ? 'flex-row-reverse text-right' : 'text-left'}`}
  >
    {team.logo && typeof team.logo === 'object' ? (
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-white/10 ring-2 ring-white/10 sm:h-20 sm:w-20">
        <MediaImage media={team.logo} priority />
      </div>
    ) : (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white/70 ring-2 ring-white/10 sm:h-20 sm:w-20 sm:text-xl">
        {team.name.charAt(0).toUpperCase()}
      </div>
    )}
    <span className="font-display text-xl font-bold uppercase italic leading-none tracking-tight text-white sm:text-3xl">
      {team.name}
    </span>
  </div>
)

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

  const [relatedArticles, watchHref, headToHead, otherGamesRaw, jsonLd] = await Promise.all([
    getArticlesRelatedToNFLGame(game.id, 3),
    getWatchGuideHrefForSport(sportSlug),
    getHeadToHeadGames(game.homeTeam.id, game.awayTeam.id, game.id),
    game.week
      ? getOtherGamesInWeek(game.competition.id, game.week, game.id)
      : Promise.resolve([]),
    Promise.resolve(getSportsEventJsonLd(game, basePath)),
  ])

  const showScore = game.status === 'live' || game.status === 'finished'
  const isLive = game.status === 'live'
  const otherGames = otherGamesRaw.map(fromNFLGame)

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: sportLabel, href: sportHref },
            { label: `${game.homeTeam.name} vs ${game.awayTeam.name}`, href: `${basePath}/${game.slug}` },
          ]}
        />
      </Container>

      {/* Dark scoreboard hero — same broadcast-vibe treatment as the
          homepage's dark bands, leaning into the bold condensed/italic
          display type for a "game broadcast" feel rather than the plain
          bordered box this replaced. */}
      <section className="mt-6 bg-brand">
        <Container className="py-8 sm:py-12">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-accent">
                <span className="h-1 w-4 rounded-full bg-accent" aria-hidden="true" />
                {game.competition.name}
              </span>
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
                  Live
                </span>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  {statusLabel[game.status]}
                </span>
              )}
            </div>

            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between sm:gap-4">
              <TeamBlock team={game.homeTeam} align="left" />

              <div className="shrink-0 text-center">
                {showScore ? (
                  <span className="font-display text-4xl font-bold italic tabular-nums text-white sm:text-5xl">
                    {game.homeScore ?? 0}
                    <span className="mx-2 text-white/30">–</span>
                    {game.awayScore ?? 0}
                  </span>
                ) : (
                  <span className="font-display text-2xl font-bold italic text-white/40 sm:text-3xl">@</span>
                )}
              </div>

              <TeamBlock team={game.awayTeam} align="right" />
            </div>

            <dl className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-white/40">Kickoff</dt>
                <dd className="mt-1 font-semibold text-white">{formatKickoff(game.kickoffTime)}</dd>
              </div>
              {game.venue ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/40">Venue</dt>
                  <dd className="mt-1 font-semibold text-white">{game.venue}</dd>
                </div>
              ) : null}
              {game.week ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/40">Week</dt>
                  <dd className="mt-1 font-semibold text-white">{game.week}</dd>
                </div>
              ) : null}
              {game.season ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/40">Season</dt>
                  <dd className="mt-1 font-semibold text-white">{game.season}</dd>
                </div>
              ) : null}
            </dl>

            {watchHref ? (
              <Button href={watchHref} className="w-fit">
                {isLive ? 'Watch Live' : 'Where to Watch'}
              </Button>
            ) : null}
          </div>
        </Container>
      </section>

      <Container className="pb-8">
        {game.preview ? (
          <Prose className="mx-auto mt-8 max-w-3xl">
            <RichText data={game.preview} />
          </Prose>
        ) : null}

        {headToHead.length > 0 ? (
          <Section title="Previous Meetings">
            <div className="grid gap-4 sm:grid-cols-3">
              {headToHead.map((meeting) => (
                <HomeFixtureCard key={meeting.id} fixture={fromNFLGame(meeting)} variant="ticker" />
              ))}
            </div>
          </Section>
        ) : null}

        {otherGames.length > 0 ? (
          <Section title={`Other ${game.week} Games`}>
            <HorizontalScroller className="pb-2">
              {otherGames.map((fixture) => (
                <HomeFixtureCard key={fixture.id} fixture={fixture} variant="ticker" />
              ))}
            </HorizontalScroller>
          </Section>
        ) : null}

        {relatedArticles.length > 0 ? (
          <Section title="Related Articles">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </Section>
        ) : null}
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  )
}
