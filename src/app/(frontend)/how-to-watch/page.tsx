import type { Metadata } from 'next'
import Link from 'next/link'

import { HowToWatchCard } from '@/components/HowToWatchCard'
import { MediaImage } from '@/components/MediaImage'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { getGuides } from '@/lib/howToWatch'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'How to Watch',
  description: 'Streaming and broadcast guides for football, NFL, boxing, and more — where to watch, region by region.',
  alternates: { canonical: '/how-to-watch' },
}

export default async function HowToWatchPage() {
  const { docs: featuredGuides } = await getGuides({ featured: true, limit: 1 })
  const featured = featuredGuides[0]

  const { docs: guides } = await getGuides({ limit: 24 })
  const rest = guides.filter((guide) => guide.id !== featured?.id)

  if (guides.length === 0) {
    return (
      <Container className="flex flex-col items-start gap-3 py-20">
        <h1 className="text-3xl font-extrabold text-ink">How-to-watch guides are on the way</h1>
        <p className="max-w-lg text-muted">
          Once guides are added in the admin panel, they&apos;ll appear here.
        </p>
        <Link href="/admin" className="font-semibold text-accent-dark hover:underline">
          Go to admin panel
        </Link>
      </Container>
    )
  }

  return (
    <Container className="py-10">
      <h1 className="mb-2 text-3xl font-extrabold text-ink">How to Watch</h1>
      <p className="mb-8 max-w-xl text-muted">
        Streaming and broadcast guides for football, NFL, boxing, and more — where to watch, region by region.
      </p>

      {featured ? (
        <Link
          href={`/how-to-watch/${featured.slug}`}
          className="group mb-10 grid overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-lg sm:grid-cols-2"
        >
          <div className="aspect-[16/9] overflow-hidden bg-surface-alt sm:aspect-auto">
            <MediaImage
              media={featured.featuredImage}
              priority
              className="transition-transform duration-200 group-hover:scale-[1.03]"
            />
          </div>
          <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              {featured.sport ? <Badge>{featured.sport.name}</Badge> : null}
              {featured.region ? (
                <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted">
                  {featured.region}
                </span>
              ) : null}
            </div>
            <h2 className="text-2xl font-extrabold leading-tight text-ink group-hover:text-accent-dark">
              {featured.title}
            </h2>
            <p className="text-muted">{featured.excerpt}</p>
          </div>
        </Link>
      ) : null}

      {rest.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((guide) => (
            <HowToWatchCard key={guide.id} guide={guide} />
          ))}
        </div>
      ) : null}
    </Container>
  )
}
