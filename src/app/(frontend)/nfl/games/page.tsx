import type { Metadata } from 'next'

import { AmericanFootballGamesIndex } from '@/components/AmericanFootballGamesIndex'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'NFL Schedule',
  description: 'Upcoming and recent NFL games, schedules, and results.',
  alternates: { canonical: '/nfl/games' },
}

export default async function NFLGamesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  return (
    <AmericanFootballGamesIndex sportSlug="nfl" title="NFL Schedule" basePath="/nfl/games" page={page} />
  )
}
