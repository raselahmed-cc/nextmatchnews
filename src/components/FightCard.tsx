import Link from 'next/link'

import type { Fighter } from '@/payload-types'
import { MediaImage } from './MediaImage'
import { Badge } from './ui/Badge'

export type FightCardEvent = {
  slug: string
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
  weightClass?: string | null
  method?: string | null
  fighterA: Fighter
  fighterB: Fighter
  winner?: Fighter | number | null
  event: { date: string; venue?: string | null }
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

const statusLabel: Record<FightCardEvent['status'], string> = {
  scheduled: 'Scheduled',
  live: 'Live',
  finished: 'Final',
  postponed: 'Postponed',
  cancelled: 'Cancelled',
}

const methodLabel: Record<string, string> = {
  ko: 'KO',
  tko: 'TKO',
  'decision-unanimous': 'Unanimous Decision',
  'decision-split': 'Split Decision',
  'decision-majority': 'Majority Decision',
  submission: 'Submission',
  draw: 'Draw',
  'no-contest': 'No Contest',
  disqualification: 'Disqualification',
}

const FighterRow = ({ fighter, isWinner }: { fighter: Fighter; isWinner: boolean }) => (
  <div className="flex items-center gap-3">
    {fighter.photo && typeof fighter.photo === 'object' ? (
      <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-surface-alt">
        <MediaImage media={fighter.photo} />
      </div>
    ) : null}
    <span className={`truncate text-sm ${isWinner ? 'font-bold text-ink' : 'font-semibold text-ink'}`}>
      {fighter.name}
      {isWinner ? ' (W)' : ''}
    </span>
  </div>
)

export const FightCard = ({
  fight,
  basePath = '/boxing/fights',
}: {
  fight: FightCardEvent
  basePath?: string
}) => {
  const winnerId = typeof fight.winner === 'object' ? fight.winner?.id : fight.winner

  return (
    <Link
      href={`${basePath}/${fight.slug}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        {fight.weightClass ? <Badge>{fight.weightClass}</Badge> : <span />}
        <span
          className={
            fight.status === 'live' ? 'font-semibold text-accent-dark' : 'font-medium text-muted'
          }
        >
          {statusLabel[fight.status]}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <FighterRow fighter={fight.fighterA} isWinner={fight.fighterA.id === winnerId} />
        <FighterRow fighter={fight.fighterB} isWinner={fight.fighterB.id === winnerId} />
      </div>
      <div className="border-t border-border pt-2 text-xs text-muted">
        {fight.status === 'finished' && fight.method
          ? methodLabel[fight.method] || fight.method
          : formatDate(fight.event.date)}
        {fight.status !== 'finished' && fight.event.venue ? ` · ${fight.event.venue}` : ''}
      </div>
    </Link>
  )
}
