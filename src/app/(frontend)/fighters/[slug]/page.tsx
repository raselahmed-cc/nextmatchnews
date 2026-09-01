import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { FightCard } from '@/components/FightCard'
import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { getAllFighterSlugs, getFighterBySlug, getFights } from '@/lib/boxing'

export const revalidate = 60

export const generateStaticParams = async () => {
  try {
    const slugs = await getAllFighterSlugs()
    return slugs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.error('Skipping fighter static params — database unavailable at build time:', error)
    return []
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const fighter = await getFighterBySlug(slug)
  if (!fighter) return {}

  return {
    title: fighter.name,
    description: fighter.bio || `${fighter.name} profile on NextMatchNews.`,
    alternates: { canonical: `/fighters/${fighter.slug}` },
  }
}

const formatDateOfBirth = (value: string | null | undefined) => {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function FighterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const fighter = await getFighterBySlug(slug)

  if (!fighter) notFound()

  const { docs: fights } = await getFights({ fighterId: fighter.id, limit: 6 })
  const record = `${fighter.wins ?? 0}-${fighter.losses ?? 0}-${fighter.draws ?? 0}`

  return (
    <Container className="py-10">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: fighter.name, href: `/fighters/${fighter.slug}` }]}
      />

      <div className="mb-8 flex items-center gap-4">
        {fighter.photo && typeof fighter.photo === 'object' ? (
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-surface-alt">
            <MediaImage media={fighter.photo} priority />
          </div>
        ) : null}
        <div>
          <h1 className="text-3xl font-extrabold text-ink">{fighter.name}</h1>
          <p className="text-muted">
            {[fighter.weightClass, fighter.nationality].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      <dl className="mb-8 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted">Record</dt>
          <dd className="font-semibold text-ink">{record}</dd>
        </div>
        {typeof fighter.knockouts === 'number' ? (
          <div>
            <dt className="text-muted">Knockouts</dt>
            <dd className="font-semibold text-ink">{fighter.knockouts}</dd>
          </div>
        ) : null}
        {fighter.dateOfBirth ? (
          <div>
            <dt className="text-muted">Date of Birth</dt>
            <dd className="font-semibold text-ink">{formatDateOfBirth(fighter.dateOfBirth)}</dd>
          </div>
        ) : null}
        {fighter.nationality ? (
          <div>
            <dt className="text-muted">Nationality</dt>
            <dd className="font-semibold text-ink">{fighter.nationality}</dd>
          </div>
        ) : null}
      </dl>

      {fighter.bio ? <p className="mb-10 max-w-xl text-muted">{fighter.bio}</p> : null}

      {fights.length > 0 ? (
        <div>
          <h2 className="mb-4 text-xl font-bold uppercase tracking-wide text-ink">Fights</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fights.map((fight) => (
              <FightCard key={fight.id} fight={fight} />
            ))}
          </div>
        </div>
      ) : null}
    </Container>
  )
}
