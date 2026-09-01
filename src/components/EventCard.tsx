import Link from 'next/link'

import type { PopulatedFightEvent } from '@/lib/boxing'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const EventCard = ({ event }: { event: PopulatedFightEvent }) => (
  <Link
    href={`/boxing/events/${event.slug}`}
    className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md"
  >
    <p className="font-semibold text-ink">{event.name}</p>
    <p className="text-xs text-muted">
      {[formatDate(event.date), event.venue, event.promotion].filter(Boolean).join(' · ')}
    </p>
  </Link>
)
