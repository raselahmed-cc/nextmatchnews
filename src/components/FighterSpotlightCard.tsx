import Link from 'next/link'

import type { Fighter } from '@/payload-types'
import { MediaImage } from './MediaImage'

// A richer, more visual fighter card than the plain directory-row FighterCard
// — used where fighters are the headline content (the boxing hub's Featured
// Fighters rail) rather than a compact list. Falls back to a monogram when
// no photo is set, which is the common case until real fighter photos are
// uploaded through the admin.
export const FighterSpotlightCard = ({ fighter }: { fighter: Fighter }) => {
  const record = `${fighter.wins ?? 0}-${fighter.losses ?? 0}-${fighter.draws ?? 0}`

  return (
    <Link
      href={`/fighters/${fighter.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-brand">
        {fighter.photo && typeof fighter.photo === 'object' ? (
          <MediaImage
            media={fighter.photo}
            className="transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-dark">
            <span className="font-display text-6xl font-extrabold text-white/15">
              {fighter.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {fighter.weightClass ? (
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {fighter.weightClass}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <p className="truncate font-display text-base font-bold text-ink">{fighter.name}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-ink">{record}</span>
          {typeof fighter.knockouts === 'number' ? (
            <span className="text-muted">{fighter.knockouts} KOs</span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
