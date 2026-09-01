import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { HowToWatchCard } from '@/components/HowToWatchCard'
import { MediaImage } from '@/components/MediaImage'
import { WatchCTA } from '@/components/WatchCTA'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { Prose } from '@/components/ui/Prose'
import { Section } from '@/components/ui/Section'
import { getAllPublishedGuideSlugs, getGuideBySlug, getRelatedGuides } from '@/lib/howToWatch'
import { richTextConverters } from '@/lib/richTextConverters'
import { getHowToWatchGuideJsonLd, getHowToWatchGuideMetadata } from '@/lib/seo'

export const revalidate = 60

export const generateStaticParams = async () => {
  try {
    const slugs = await getAllPublishedGuideSlugs()
    return slugs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.error('Skipping how-to-watch static params — database unavailable at build time:', error)
    return []
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const guide = await getGuideBySlug(slug)
  if (!guide) return {}
  return getHowToWatchGuideMetadata(guide)
}

export default async function HowToWatchGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = await getGuideBySlug(slug)

  if (!guide) notFound()

  const related = await getRelatedGuides(guide.id, guide.sport?.id, 3)
  const jsonLd = getHowToWatchGuideJsonLd(guide)

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'How to Watch', href: '/how-to-watch' },
          { label: guide.title, href: `/how-to-watch/${guide.slug}` },
        ]}
      />

      <article className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {guide.sport ? <Badge>{guide.sport.name}</Badge> : null}
            {guide.region ? (
              <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted">
                {guide.region}
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{guide.title}</h1>
          <p className="text-lg text-muted">{guide.excerpt}</p>
        </header>

        <div className="mb-8 aspect-[16/9] overflow-hidden rounded-lg bg-surface-alt">
          <MediaImage media={guide.featuredImage} priority />
        </div>

        <div className="mb-8">
          <WatchCTA options={guide.streamingOptions} />
        </div>

        <Prose>
          <RichText data={guide.content} converters={richTextConverters} />
        </Prose>
      </article>

      {related.length > 0 ? (
        <Section title="More How-to-Watch Guides">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((relatedGuide) => (
              <HowToWatchCard key={relatedGuide.id} guide={relatedGuide} />
            ))}
          </div>
        </Section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Container>
  )
}
