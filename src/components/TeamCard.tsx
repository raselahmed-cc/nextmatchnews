import Link from 'next/link'

import type { PopulatedTeam } from '@/lib/sports'
import { MediaImage } from './MediaImage'

export const TeamCard = ({ team }: { team: PopulatedTeam }) => (
  <Link
    href={`/teams/${team.slug}`}
    className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md"
  >
    {team.logo && typeof team.logo === 'object' ? (
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-alt">
        <MediaImage media={team.logo} />
      </div>
    ) : null}
    <div className="min-w-0">
      <p className="truncate font-semibold text-ink">{team.name}</p>
      {team.country ? <p className="truncate text-xs text-muted">{team.country}</p> : null}
    </div>
  </Link>
)
