import Link from 'next/link'

import type { HomeFixture } from '@/lib/homepage'
import { cn } from '@/lib/cn'
import { MediaImage } from './MediaImage'

const formatKickoff = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

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
    <div className="flex min-w-0 items-center gap-2">
      {participant.media ? (
        <div
          className={cn(
            'h-6 w-6 shrink-0 overflow-hidden rounded-full',
            dark ? 'bg-white/10' : 'bg-surface-alt',
          )}
        >
          <MediaImage media={participant.media} />
        </div>
      ) : null}
      <span className={cn('truncate text-sm font-semibold', dark ? 'text-white' : 'text-ink')}>
        {participant.name}
      </span>
    </div>
    {showScore ? (
      <span className={cn('shrink-0 text-sm font-bold', dark ? 'text-white' : 'text-ink')}>
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
        'flex flex-col gap-3 rounded-lg border p-4 transition-colors',
        isResult
          ? 'border-white/10 bg-white/5 hover:bg-white/10'
          : 'w-64 shrink-0 snap-start border-border bg-surface hover:shadow-md',
      )}
    >
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
      <div className="flex flex-col gap-2">
        <ParticipantRow
          participant={fixture.participantA}
          score={fixture.scoreA}
          showScore={showScore}
          dark={isResult}
        />
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
