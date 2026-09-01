import type { Metadata } from 'next'
import Link from 'next/link'

import { EventCard } from '@/components/EventCard'
import { Container } from '@/components/ui/Container'
import { getFightEvents } from '@/lib/boxing'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Boxing Events',
  description: 'Upcoming and recent boxing events and fight cards.',
  alternates: { canonical: '/boxing/events' },
}

const PAGE_SIZE = 20

export default async function BoxingEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { docs: events, totalPages, hasNextPage, hasPrevPage } = await getFightEvents({
    sportSlug: 'boxing',
    limit: PAGE_SIZE,
    page,
  })

  return (
    <Container className="py-10">
      <h1 className="mb-8 text-3xl font-extrabold text-ink">Boxing Events</h1>

      {events.length === 0 ? (
        <p className="text-muted">No events have been added yet. Check back soon.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4 text-sm font-semibold">
          {hasPrevPage ? (
            <Link href={`/boxing/events?page=${page - 1}`} className="text-accent-dark hover:underline">
              Previous
            </Link>
          ) : null}
          <span className="text-muted">
            Page {page} of {totalPages}
          </span>
          {hasNextPage ? (
            <Link href={`/boxing/events?page=${page + 1}`} className="text-accent-dark hover:underline">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </Container>
  )
}
