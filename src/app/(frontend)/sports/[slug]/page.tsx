import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CompetitionCard } from '@/components/CompetitionCard'
import { Container } from '@/components/ui/Container'
import { getAllSportSlugs, getCompetitionsBySport, getSportBySlug } from '@/lib/sports'

export const revalidate = 60

// Sports with their own bespoke top-level hub page redirect there instead of
// rendering this generic template, so the same content is never reachable at
// two URLs. NFL and NCAA Football are separate Sports (different competition
// tiers of the same underlying sport, not the same sport merged together) —
// both have bespoke pages here. Any other sport (e.g. Basketball/NBA)
// deliberately renders through the generic template below. This is the
// extensibility system: adding a new sport only means adding rows to the
// Sports/Competitions/Teams/Players collections — a bespoke page is optional,
// not required.
const PRIMARY_VERTICAL_REDIRECTS: Record<string, string> = {
  football: '/football',
  nfl: '/nfl',
  'ncaa-football': '/ncaa',
  boxing: '/boxing',
}

export const generateStaticParams = async () => {
  try {
    const slugs = await getAllSportSlugs()
    return slugs
      .filter((doc) => !PRIMARY_VERTICAL_REDIRECTS[doc.slug])
      .map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.error('Skipping sport static params — database unavailable at build time:', error)
    return []
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  if (PRIMARY_VERTICAL_REDIRECTS[slug]) return {}

  const sport = await getSportBySlug(slug)
  if (!sport) return {}

  return {
    title: sport.name,
    description: sport.description || `${sport.name} news, competitions, and teams on NextMatchNews.`,
    alternates: { canonical: `/sports/${sport.slug}` },
  }
}

export default async function SportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (PRIMARY_VERTICAL_REDIRECTS[slug]) {
    redirect(PRIMARY_VERTICAL_REDIRECTS[slug])
  }

  const sport = await getSportBySlug(slug)
  if (!sport) notFound()

  const competitions = await getCompetitionsBySport(sport.id)

  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: sport.name, href: `/sports/${sport.slug}` }]} />

      <h1 className="mb-2 text-3xl font-extrabold text-ink">{sport.name}</h1>
      {sport.description ? <p className="mb-8 max-w-xl text-muted">{sport.description}</p> : null}

      {competitions.length === 0 ? (
        <p className="text-muted">No competitions added for {sport.name} yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {competitions.map((competition) => (
            <CompetitionCard key={competition.id} competition={competition} />
          ))}
        </div>
      )}
    </Container>
  )
}
