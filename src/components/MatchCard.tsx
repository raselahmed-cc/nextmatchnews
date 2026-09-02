import Link from 'next/link'

import type { Team } from '@/payload-types'
import { cn } from '@/lib/cn'
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

const TeamRow = ({ team, score, winning }: { team: Team; score?: number | null; winning?: boolean }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-2.5">
      {team.logo && typeof team.logo === 'object' ? (
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-alt">
          <MediaImage media={team.logo} />
        </div>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-alt text-xs font-bold text-muted">
          {team.name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className={cn('truncate text-sm', winning ? 'font-bold text-ink' : 'font-semibold text-ink')}>
        {team.name}
      </span>
    </div>
    {typeof score === 'number' ? (
      <span className={cn('text-base tabular-nums', winning ? 'font-extrabold text-ink' : 'font-bold text-muted')}>
        {score}
      </span>
    ) : null}
  </div>
)

export const MatchCard = ({
  match,
  basePath = '/matches',
  watchHref,
}: {
  match: MatchCardEvent
  basePath?: string
  // Precomputed link to the sport's "How to Watch" guide (resolved once per
  // page via getWatchGuideHrefForSport — see src/lib/howToWatch.ts — not
  // fetched per-card). Omitted entirely if no guide exists yet for that
  // sport, rather than linking somewhere thin or broken.
  watchHref?: string | null
}) => {
  const isLive = match.status === 'live'
  const showScore = isLive || match.status === 'finished'
  const homeWinning =
    match.status === 'finished' &&
    typeof match.homeScore === 'number' &&
    typeof match.awayScore === 'number' &&
    match.homeScore > match.awayScore
  const awayWinning =
    match.status === 'finished' &&
    typeof match.homeScore === 'number' &&
    typeof match.awayScore === 'number' &&
    match.awayScore > match.homeScore

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border bg-surface transition-shadow hover:shadow-md',
        isLive ? 'border-accent/40' : 'border-border',
      )}
    >
      {isLive ? <div className="h-1 bg-accent" aria-hidden="true" /> : null}
      <Link href={`${basePath}/${match.slug}`} className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2 text-xs">
          <Badge>{match.competition.name}</Badge>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
              Live
            </span>
          ) : (
            <span className="font-medium text-muted">{statusLabel[match.status]}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <TeamRow team={match.homeTeam} score={showScore ? match.homeScore : undefined} winning={homeWinning} />
          <TeamRow team={match.awayTeam} score={showScore ? match.awayScore : undefined} winning={awayWinning} />
        </div>
        <div className="border-t border-border pt-2 text-xs text-muted">
          {formatKickoff(match.kickoffTime)}
          {match.venue ? ` · ${match.venue}` : ''}
        </div>
      </Link>
      {watchHref ? (
        <Link
          href={watchHref}
          className={cn(
            'flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors',
            isLive
              ? 'bg-accent text-white hover:bg-accent-dark'
              : 'border-t border-border text-accent-dark hover:bg-surface-alt',
          )}
        >
          {isLive ? 'Watch Live' : 'Where to Watch'}
        </Link>
      ) : null}
    </div>
  )
}
