import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import { Prose } from '@/components/ui/Prose'
import { siteConfig } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: `How ${siteConfig.name} uses affiliate links.`,
  alternates: { canonical: '/affiliate-disclosure' },
}

export default function AffiliateDisclosurePage() {
  return (
    <Container className="py-10">
      <Prose>
        <h1>Affiliate Disclosure</h1>
        <p>
          {siteConfig.name} participates in affiliate programs with sports streaming and media
          services. This means that if you click certain links on this site and sign up for or
          purchase a service, we may earn a commission — at no additional cost to you.
        </p>
        <h2>Our editorial standards</h2>
        <p>
          Affiliate relationships never influence our match coverage, news reporting, or editorial
          opinions. We link to streaming and broadcast options because they are genuinely relevant to
          the sports content on the page, not the other way around. Every match, game, and fight page
          is written to be useful on its own, whether or not you ever click a &quot;Where to Watch&quot;
          link.
        </p>
        <h2>How to identify affiliate links</h2>
        <p>
          Affiliate links are typically labeled with wording like &quot;Watch Live,&quot; &quot;Where to
          Watch,&quot; or &quot;Check Streaming Options.&quot; We do not use misleading language such as
          claiming a stream is free when it requires a paid subscription.
        </p>
      </Prose>
    </Container>
  )
}
