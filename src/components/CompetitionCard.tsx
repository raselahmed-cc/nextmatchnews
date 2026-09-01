import Link from 'next/link'

import type { PopulatedCompetition } from '@/lib/sports'
import { MediaImage } from './MediaImage'

export const CompetitionCard = ({ competition }: { competition: PopulatedCompetition }) => (
  <Link
    href={`/competitions/${competition.slug}`}
    className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md"
  >
    {competition.logo && typeof competition.logo === 'object' ? (
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-alt">
        <MediaImage media={competition.logo} />
      </div>
    ) : null}
    <div className="min-w-0">
      <p className="truncate font-semibold text-ink">{competition.name}</p>
      {competition.country ? <p className="truncate text-xs text-muted">{competition.country}</p> : null}
    </div>
  </Link>
)
