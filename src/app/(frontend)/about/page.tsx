import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import { Prose } from '@/components/ui/Prose'
import { siteConfig } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'About',
  description: `About ${siteConfig.name} — our mission, coverage, and editorial standards.`,
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <Container className="py-10">
      <Prose>
        <h1>About {siteConfig.name}</h1>
        <p>
          {siteConfig.name} covers football, NFL, and boxing — match information, news, and
          how-to-watch guides for fans who want accurate, up-to-date coverage in one place.
        </p>
        <h2>Our approach</h2>
        <p>
          We prioritize editorial accuracy and usefulness over pageview-chasing. Every match, game,
          and fight page is built to be useful on its own, whether or not a reader ever clicks a
          streaming link. Articles are written and reviewed by our editorial team; we do not publish
          fabricated statistics, quotes, or results.
        </p>
        <h2>How we make money</h2>
        <p>
          {siteConfig.name} earns commission through affiliate partnerships with streaming and
          sports-media services. This never affects the accuracy of our news or match coverage — see
          our <a href="/affiliate-disclosure">Affiliate Disclosure</a> for details.
        </p>
      </Prose>
    </Container>
  )
}
