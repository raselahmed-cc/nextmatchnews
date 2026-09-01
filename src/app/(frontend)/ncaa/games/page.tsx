import type { Metadata } from 'next'

import { AmericanFootballGamesIndex } from '@/components/AmericanFootballGamesIndex'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'NCAA Football Schedule',
  description: 'Upcoming and recent NCAA Football games, schedules, and results.',
  alternates: { canonical: '/ncaa/games' },
}

export default async function NCAAFootballGamesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  return (
    <AmericanFootballGamesIndex
      sportSlug="ncaa-football"
      title="NCAA Football Schedule"
      basePath="/ncaa/games"
      page={page}
    />
  )
}
