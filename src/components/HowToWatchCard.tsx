import Link from 'next/link'

import type { PopulatedHowToWatchGuide } from '@/lib/howToWatch'
import { MediaImage } from './MediaImage'
import { Badge } from './ui/Badge'

export const HowToWatchCard = ({
  guide,
  priority,
}: {
  guide: PopulatedHowToWatchGuide
  priority?: boolean
}) => (
  <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-md">
    <Link href={`/how-to-watch/${guide.slug}`} className="block aspect-[16/9] overflow-hidden bg-surface-alt">
      <MediaImage
        media={guide.featuredImage}
        priority={priority}
        className="transition-transform duration-200 group-hover:scale-[1.03]"
      />
    </Link>
    <div className="flex flex-1 flex-col gap-2 p-4">
      <div className="flex flex-wrap gap-2">
        {guide.sport ? <Badge>{guide.sport.name}</Badge> : null}
        {guide.region ? (
          <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted">
            {guide.region}
          </span>
        ) : null}
      </div>
      <h3 className="text-lg font-bold leading-snug text-ink">
        <Link href={`/how-to-watch/${guide.slug}`} className="hover:text-accent-dark">
          {guide.title}
        </Link>
      </h3>
      <p className="line-clamp-2 text-sm text-muted">{guide.excerpt}</p>
    </div>
  </article>
)
