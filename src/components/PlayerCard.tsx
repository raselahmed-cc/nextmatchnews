import Link from 'next/link'

import type { PopulatedPlayer } from '@/lib/sports'
import { MediaImage } from './MediaImage'

export const PlayerCard = ({ player }: { player: PopulatedPlayer }) => (
  <Link
    href={`/players/${player.slug}`}
    className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md"
  >
    {player.photo && typeof player.photo === 'object' ? (
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-alt">
        <MediaImage media={player.photo} />
      </div>
    ) : null}
    <div className="min-w-0">
      <p className="truncate font-semibold text-ink">{player.name}</p>
      {player.position ? <p className="truncate text-xs text-muted">{player.position}</p> : null}
    </div>
  </Link>
)
