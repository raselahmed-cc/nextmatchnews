import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { getAllPlayerSlugs, getPlayerBySlug } from '@/lib/sports'

export const revalidate = 60

export const generateStaticParams = async () => {
  try {
    const slugs = await getAllPlayerSlugs()
    return slugs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.error('Skipping player static params — database unavailable at build time:', error)
    return []
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const player = await getPlayerBySlug(slug)
  if (!player) return {}

  return {
    title: player.name,
    description: player.bio || `${player.name} profile on NextMatchNews.`,
    alternates: { canonical: `/players/${player.slug}` },
  }
}

const formatDateOfBirth = (value: string | null | undefined) => {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const player = await getPlayerBySlug(slug)

  if (!player) notFound()

  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: player.name, href: `/players/${player.slug}` }]} />

      <div className="mb-8 flex items-center gap-4">
        {player.photo && typeof player.photo === 'object' ? (
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-surface-alt">
            <MediaImage media={player.photo} priority />
          </div>
        ) : null}
        <div>
          <h1 className="text-3xl font-extrabold text-ink">{player.name}</h1>
          <p className="text-muted">
            {[player.position, player.nationality].filter(Boolean).join(' · ')}
          </p>
          {player.team && typeof player.team === 'object' ? (
            <Link href={`/teams/${player.team.slug}`} className="text-sm font-semibold text-accent-dark hover:underline">
              {player.team.name}
            </Link>
          ) : null}
        </div>
      </div>

      <dl className="mb-8 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        {player.dateOfBirth ? (
          <div>
            <dt className="text-muted">Date of Birth</dt>
            <dd className="font-semibold text-ink">{formatDateOfBirth(player.dateOfBirth)}</dd>
          </div>
        ) : null}
        {player.nationality ? (
          <div>
            <dt className="text-muted">Nationality</dt>
            <dd className="font-semibold text-ink">{player.nationality}</dd>
          </div>
        ) : null}
        {player.position ? (
          <div>
            <dt className="text-muted">Position</dt>
            <dd className="font-semibold text-ink">{player.position}</dd>
          </div>
        ) : null}
      </dl>

      {player.bio ? <p className="max-w-xl text-muted">{player.bio}</p> : null}
    </Container>
  )
}
