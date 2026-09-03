import Link from 'next/link'

import type { HomeFixture } from '@/lib/homepage'
import { cn } from '@/lib/cn'
import { MediaImage } from './MediaImage'

const formatKickoff = (value: string) => {
  const date = new Date(value)
  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / dayMs)

  const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (diffDays === 0) return `Today, ${time}`
  if (diffDays === 1) return `Tomorrow, ${time}`

  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

const ParticipantRow = ({
  participant,
  score,
  showScore,
  dark,
}: {
  participant: HomeFixture['participantA']
  score?: number | null
  showScore: boolean
  dark?: boolean
}) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-2.5">
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold',
          dark ? 'bg-white/10 text-white/70' : 'bg-surface-alt text-muted ring-1 ring-border/60',
        )}
      >
        {participant.media ? <MediaImage media={participant.media} /> : initials(participant.name)}
      </div>
      <span className={cn('truncate text-sm font-semibold', dark ? 'text-white' : 'text-ink')}>
        {participant.name}
      </span>
    </div>
    {showScore ? (
      <span className={cn('shrink-0 text-sm font-bold tabular-nums', dark ? 'text-white' : 'text-ink')}>
        {typeof score === 'number' ? score : '–'}
      </span>
    ) : null}
  </div>
)

// Renders both team-vs-team (football/NFL/NCAA) and fighter-vs-fighter
// (boxing) fixtures from the unified HomeFixture shape (see src/lib/homepage.ts).
// `ticker` is a compact card for the horizontal-scroll Live/Upcoming strip;
// `result` is a larger, score-emphasized card for the dark Highlights band.
export const HomeFixtureCard = ({
  fixture,
  variant = 'ticker',
}: {
  fixture: HomeFixture
  variant?: 'ticker' | 'result'
}) => {
  const isResult = variant === 'result'
  const showScore = fixture.status === 'live' || fixture.status === 'finished'

  return (
    <Link
      href={`${fixture.basePath}/${fixture.slug}`}
      className={cn(
        'group/card relative flex flex-col gap-3 overflow-hidden rounded-xl border p-4 transition-all',
        isResult
          ? 'border-white/10 bg-white/5 hover:bg-white/10'
          : 'w-72 shrink-0 snap-start border-border bg-surface shadow-sm hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg',
      )}
    >
      {!isResult ? (
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-200 group-hover/card:scale-x-100',
            fixture.status === 'live' && 'scale-x-100',
          )}
        />
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
            isResult ? 'bg-white/10 text-white' : 'bg-accent/10 text-accent-dark',
          )}
        >
          {fixture.sportLabel}
        </span>
        {fixture.status === 'live' ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
            LIVE
          </span>
        ) : (
          <span className={cn('text-xs font-medium', isResult ? 'text-white/60' : 'text-muted')}>
            {fixture.status === 'finished' ? 'Full Time' : formatKickoff(fixture.kickoff)}
          </span>
        )}
      </div>
      <div className="relative flex flex-col gap-2">
        <ParticipantRow
          participant={fixture.participantA}
          score={fixture.scoreA}
          showScore={showScore}
          dark={isResult}
        />
        {!showScore ? (
          <div className="flex items-center gap-2">
            <span
              className={cn('h-px flex-1', isResult ? 'bg-white/15' : 'bg-border')}
              aria-hidden="true"
            />
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest',
                isResult ? 'bg-white/10 text-white/50' : 'bg-surface-alt text-muted',
              )}
            >
              VS
            </span>
            <span
              className={cn('h-px flex-1', isResult ? 'bg-white/15' : 'bg-border')}
              aria-hidden="true"
            />
          </div>
        ) : null}
        <ParticipantRow
          participant={fixture.participantB}
          score={fixture.scoreB}
          showScore={showScore}
          dark={isResult}
        />
      </div>
      <div
        className={cn(
          'truncate border-t pt-2 text-xs',
          isResult ? 'border-white/10 text-white/60' : 'border-border text-muted',
        )}
      >
        {fixture.resultNote || fixture.competitionName}
      </div>
    </Link>
  )
}
