import type { Metadata } from 'next'
import Link from 'next/link'

import { ArticleCard } from '@/components/ArticleCard'
import { EventCard } from '@/components/EventCard'
import { FighterSpotlightCard } from '@/components/FighterSpotlightCard'
import { HighlightCard } from '@/components/HighlightCard'
import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import type { Fighter } from '@/payload-types'
import { getFightersBySport, getFightEvents, getFights } from '@/lib/boxing'
import { getCategoryBySlug, getPublishedArticles } from '@/lib/data'
import { getHighlightsBySport } from '@/lib/highlights'
import { getSportBySlug } from '@/lib/sports'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Boxing',
  description: 'Boxing events, fight cards, fighters, and news.',
  alternates: { canonical: '/boxing' },
}

const formatFightDate = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const ViewAllLink = ({ href }: { href: string }) => (
  <Link href={href} className="text-sm font-semibold text-accent-dark hover:underline">
    View all
  </Link>
)

export default async function BoxingPage() {
  const sport = await getSportBySlug('boxing')

  if (!sport) {
    return (
      <Container className="flex flex-col items-start gap-3 py-20">
        <h1 className="text-3xl font-extrabold text-ink">Boxing coverage is being set up</h1>
        <p className="max-w-lg text-muted">
          Once events and fights are added in the admin panel, they&apos;ll appear here.
        </p>
        <Link href="/admin" className="font-semibold text-accent-dark hover:underline">
          Go to admin panel
        </Link>
      </Container>
    )
  }

  const boxingCategory = await getCategoryBySlug('boxing')

  const [{ docs: upcomingFights }, { docs: upcomingEvents }, highlights, { docs: articles }] = await Promise.all([
    getFights({ status: 'scheduled', sportSlug: 'boxing', limit: 20 }),
    getFightEvents({ sportSlug: 'boxing', upcomingOnly: true, limit: 6 }),
    getHighlightsBySport('boxing', 6),
    boxingCategory
      ? getPublishedArticles({ categoryId: boxingCategory.id, limit: 6 })
      : Promise.resolve({ docs: [] }),
  ])

  const sortedFights = [...upcomingFights].sort(
    (a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime(),
  )
  const nextFight = sortedFights[0] ?? null

  const fightersFromCard = new Map<number, Fighter>()
  for (const fight of sortedFights.slice(0, 6)) {
    fightersFromCard.set(fight.fighterA.id, fight.fighterA)
    fightersFromCard.set(fight.fighterB.id, fight.fighterB)
  }
  const featuredFighters =
    fightersFromCard.size > 0
      ? Array.from(fightersFromCard.values()).slice(0, 8)
      : await getFightersBySport('boxing', 8)

  const icon = sport.icon && typeof sport.icon === 'object' ? sport.icon : null

  return (
    <>
      <section className="relative overflow-hidden bg-brand-dark">
        {nextFight ? (
          <>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[140%] w-[140%] rounded-full bg-accent/10 blur-3xl" />
            </div>
            <Container className="relative flex flex-col items-center gap-6 py-14 text-center sm:py-20">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Next Big Fight
              </span>
              <div className="flex w-full max-w-3xl items-center justify-center gap-4 sm:gap-8">
                <div className="flex flex-1 flex-col items-center gap-2">
                  <span className="font-display text-2xl font-extrabold uppercase leading-tight text-white sm:text-4xl">
                    {nextFight.fighterA.name}
                  </span>
                  <span className="text-xs text-white/50">
                    {nextFight.fighterA.wins ?? 0}-{nextFight.fighterA.losses ?? 0}-{nextFight.fighterA.draws ?? 0}
                  </span>
                </div>
                <span className="font-display shrink-0 text-2xl font-black text-accent sm:text-3xl">VS</span>
                <div className="flex flex-1 flex-col items-center gap-2">
                  <span className="font-display text-2xl font-extrabold uppercase leading-tight text-white sm:text-4xl">
                    {nextFight.fighterB.name}
                  </span>
                  <span className="text-xs text-white/50">
                    {nextFight.fighterB.wins ?? 0}-{nextFight.fighterB.losses ?? 0}-{nextFight.fighterB.draws ?? 0}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-white/70">
                {nextFight.weightClass ? (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    {nextFight.weightClass}
                  </span>
                ) : null}
                <span>{nextFight.event.name}</span>
                <span aria-hidden="true">·</span>
                <span>{formatFightDate(nextFight.event.date)}</span>
                {nextFight.event.venue ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{nextFight.event.venue}</span>
                  </>
                ) : null}
              </div>
              <Link
                href={`/boxing/fights/${nextFight.slug}`}
                className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                View Fight Card
              </Link>
            </Container>
          </>
        ) : (
          <>
            {icon ? (
              <div className="absolute inset-0">
                <MediaImage media={icon} className="opacity-25" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/85 to-brand-dark/60" />
              </div>
            ) : null}
            <Container className="relative flex flex-col gap-2 py-12 sm:py-16">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">Sport Hub</span>
              <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-white sm:text-5xl">
                Boxing
              </h1>
              {sport.description ? (
                <p className="max-w-xl text-base text-white/75 sm:text-lg">{sport.description}</p>
              ) : null}
            </Container>
          </>
        )}
      </section>

      {upcomingEvents.length > 0 ? (
        <Section title="Upcoming Events" action={<ViewAllLink href="/boxing/events" />}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </Section>
      ) : null}

      {featuredFighters.length > 0 ? (
        <Section title="Featured Fighters" className="bg-surface-alt">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {featuredFighters.map((fighter) => (
              <FighterSpotlightCard key={fighter.id} fighter={fighter} />
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
          action={boxingCategory ? <ViewAllLink href={`/categories/${boxingCategory.slug}`} /> : undefined}
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </Section>
      ) : null}
    </>
  )
}
