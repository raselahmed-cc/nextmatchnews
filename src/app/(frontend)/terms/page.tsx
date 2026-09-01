import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import { Prose } from '@/components/ui/Prose'
import { siteConfig } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: `The terms governing your use of ${siteConfig.name}.`,
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <Container className="py-10">
      <Prose>
        <h1>Terms of Use</h1>
        <p>
          <em>This is a starter terms page. Have it reviewed by a qualified professional before launch.</em>
        </p>
        <h2>Use of this site</h2>
        <p>
          {siteConfig.name} provides sports news and match information for informational purposes.
          Content is provided &quot;as is&quot; without warranties of any kind. Scores, schedules, and
          other match data may change and should be verified with an official source.
        </p>
        <h2>Third-party links</h2>
        <p>
          This site contains links to third-party services, including affiliate partners. We are not
          responsible for the content, availability, or practices of third-party sites.
        </p>
        <h2>Intellectual property</h2>
        <p>
          Original articles, graphics, and branding on this site are the property of {siteConfig.name}
          unless otherwise credited. Team names, logos, and competition names belong to their
          respective owners.
        </p>
        <h2>Changes</h2>
        <p>We may update these terms from time to time. Continued use of the site constitutes acceptance of the current terms.</p>
      </Prose>
    </Container>
  )
}
