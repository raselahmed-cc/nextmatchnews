import Link from 'next/link'

import type { Team } from '@/payload-types'
import { MediaImage } from './MediaImage'
import { Badge } from './ui/Badge'

// Shared by any team-sport event (football matches, NFL games, ...) — see the
// matching SportsEventInput type in src/lib/seo.ts for why this is structural
// rather than importing one collection's generated type.
export type MatchCardEvent = {
  slug: string
  kickoffTime: string
  venue?: string | null
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
  homeScore?: number | null
  awayScore?: number | null
  homeTeam: Team
  awayTeam: Team
  competition: { name: string }
}

const formatKickoff = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const statusLabel: Record<MatchCardEvent['status'], string> = {
  scheduled: 'Scheduled',
  live: 'Live',
  finished: 'Full Time',
  postponed: 'Postponed',
  cancelled: 'Cancelled',
}

const TeamRow = ({ team, score }: { team: Team; score?: number | null }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-2">
      {team.logo && typeof team.logo === 'object' ? (
        <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-surface-alt">
          <MediaImage media={team.logo} />
        </div>
      ) : null}
      <span className="truncate text-sm font-semibold text-ink">{team.name}</span>
    </div>
    {typeof score === 'number' ? <span className="text-sm font-bold text-ink">{score}</span> : null}
  </div>
)

export const MatchCard = ({
  match,
  basePath = '/matches',
}: {
  match: MatchCardEvent
  basePath?: string
}) => {
  const showScore = match.status === 'live' || match.status === 'finished'

  return (
    <Link
      href={`${basePath}/${match.slug}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <Badge>{match.competition.name}</Badge>
        <span
          className={
            match.status === 'live' ? 'font-semibold text-accent-dark' : 'font-medium text-muted'
          }
        >
          {statusLabel[match.status]}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <TeamRow team={match.homeTeam} score={showScore ? match.homeScore : undefined} />
        <TeamRow team={match.awayTeam} score={showScore ? match.awayScore : undefined} />
      </div>
      <div className="border-t border-border pt-2 text-xs text-muted">
        {formatKickoff(match.kickoffTime)}
        {match.venue ? ` · ${match.venue}` : ''}
      </div>
    </Link>
  )
}
