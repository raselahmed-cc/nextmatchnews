import type { Metadata } from 'next'

import { AmericanFootballGamePage } from '@/components/AmericanFootballGamePage'
import { getAllNFLGameSlugsForSport, getNFLGameMetadataForSport } from '@/lib/nfl'

export const revalidate = 60

export const generateStaticParams = async () => {
  try {
    const slugs = await getAllNFLGameSlugsForSport('nfl')
    return slugs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.error('Skipping NFL game static params — database unavailable at build time:', error)
    return []
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  return getNFLGameMetadataForSport(slug, 'nfl', '/nfl/games')
}

export default async function NFLGamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <AmericanFootballGamePage
      slug={slug}
      sportSlug="nfl"
      sportLabel="NFL"
      sportHref="/nfl"
      basePath="/nfl/games"
    />
  )
}
