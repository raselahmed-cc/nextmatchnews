import type { Metadata } from 'next'
import Link from 'next/link'

import { EventCard } from '@/components/EventCard'
import { Container } from '@/components/ui/Container'
import { getFightEvents } from '@/lib/boxing'
import { getSportBySlug } from '@/lib/sports'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Boxing',
  description: 'Boxing events, fight cards, fighters, and news.',
  alternates: { canonical: '/boxing' },
}

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

  const { docs: upcomingEvents } = await getFightEvents({
    sportSlug: 'boxing',
    upcomingOnly: true,
    limit: 6,
  })

  return (
    <Container className="py-10">
      <h1 className="mb-2 text-3xl font-extrabold text-ink">Boxing</h1>
      {sport.description ? <p className="mb-8 max-w-xl text-muted">{sport.description}</p> : null}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold uppercase tracking-wide text-ink">Upcoming Events</h2>
        <Link href="/boxing/events" className="text-sm font-semibold text-accent-dark hover:underline">
          View all
        </Link>
      </div>
      {upcomingEvents.length === 0 ? (
        <p className="text-muted">No upcoming events added yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </Container>
  )
}
