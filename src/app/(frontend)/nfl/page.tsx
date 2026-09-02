import type { Metadata } from 'next'

import { AmericanFootballSportHub } from '@/components/AmericanFootballSportHub'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'NFL',
  description: 'NFL teams, schedules, scores, and news.',
  alternates: { canonical: '/nfl' },
}

export default function NFLPage() {
  return (
    <AmericanFootballSportHub
      sportSlug="nfl"
      categorySlug="nfl"
      title="NFL"
      gamesIndexHref="/nfl/games"
      gamesBasePath="/nfl/games"
    />
  )
}
