import type { Metadata } from 'next'

import { AmericanFootballSportHub } from '@/components/AmericanFootballSportHub'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'NCAA Football',
  description: 'NCAA Football teams, schedules, scores, and news.',
  alternates: { canonical: '/ncaa' },
}

export default function NCAAFootballPage() {
  return (
    <AmericanFootballSportHub
      sportSlug="ncaa-football"
      categorySlug="ncaa-football"
      title="NCAA Football"
      gamesIndexHref="/ncaa/games"
      gamesBasePath="/ncaa/games"
    />
  )
}
