import Link from 'next/link'

import type { PopulatedFighter } from '@/lib/boxing'
import { MediaImage } from './MediaImage'

export const FighterCard = ({ fighter }: { fighter: PopulatedFighter }) => (
  <Link
    href={`/fighters/${fighter.slug}`}
    className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md"
  >
    {fighter.photo && typeof fighter.photo === 'object' ? (
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-alt">
        <MediaImage media={fighter.photo} />
      </div>
    ) : null}
    <div className="min-w-0">
      <p className="truncate font-semibold text-ink">{fighter.name}</p>
      <p className="truncate text-xs text-muted">
        {[fighter.weightClass, `${fighter.wins ?? 0}-${fighter.losses ?? 0}-${fighter.draws ?? 0}`]
          .filter(Boolean)
          .join(' · ')}
      </p>
    </div>
  </Link>
)
