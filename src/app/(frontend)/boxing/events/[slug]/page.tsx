import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { FightCard } from '@/components/FightCard'
import { Container } from '@/components/ui/Container'
import { getAllFightEventSlugs, getFightEventBySlug, getFights } from '@/lib/boxing'

export const revalidate = 60

export const generateStaticParams = async () => {
  try {
    const slugs = await getAllFightEventSlugs('boxing')
    return slugs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.error('Skipping boxing event static params — database unavailable at build time:', error)
    return []
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const event = await getFightEventBySlug(slug)
  if (!event) return {}

  return {
    title: event.name,
    description:
      event.description ||
      `${event.name}${event.venue ? ` at ${event.venue}` : ''} — full fight card on NextMatchNews.`,
    alternates: { canonical: `/boxing/events/${event.slug}` },
  }
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

export default async function BoxingEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getFightEventBySlug(slug)

  if (!event) notFound()

  const { docs: fights } = await getFights({ eventId: event.id, limit: 50 })

  return (
    <Container className="py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Boxing', href: '/boxing' },
          { label: event.name, href: `/boxing/events/${event.slug}` },
        ]}
      />

      <h1 className="mb-2 text-3xl font-extrabold text-ink">{event.name}</h1>
      <p className="mb-8 text-muted">
        {[formatDate(event.date), event.venue, event.location, event.promotion].filter(Boolean).join(' · ')}
      </p>

      {event.description ? <p className="mb-8 max-w-xl text-muted">{event.description}</p> : null}

      <h2 className="mb-4 text-xl font-bold uppercase tracking-wide text-ink">Fight Card</h2>
      {fights.length === 0 ? (
        <p className="text-muted">No fights added for this event yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fights.map((fight) => (
            <FightCard key={fight.id} fight={fight} />
          ))}
        </div>
      )}
    </Container>
  )
}
