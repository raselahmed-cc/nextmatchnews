import type { Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Prose } from '@/components/ui/Prose'
import { siteConfig } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${siteConfig.name} collects, uses, and protects your data.`,
  alternates: { canonical: '/privacy-policy' },
}

export default function PrivacyPolicyPage() {
  return (
    <Container className="py-10">
      <Prose>
        <h1>Privacy Policy</h1>
        <p>
          <em>
            This is a starter policy. Have it reviewed by a qualified professional before launch to
            ensure it matches your actual data practices and complies with applicable law (e.g. GDPR,
            CCPA).
          </em>
        </p>
        <h2>Information we collect</h2>
        <p>
          We collect limited technical information automatically, such as pages visited, referring
          source, and general device/browser information, to understand site usage and improve our
          content. We do not require you to create an account to read articles.
        </p>
        <h2>Cookies and analytics</h2>
        <p>
          We may use cookies and similar technologies for analytics and to remember basic preferences.
          You can control cookies through your browser settings.
        </p>
        <h2>Affiliate links</h2>
        <p>
          Some links on this site are affiliate links. If you click one and make a purchase or sign
          up, we may earn a commission at no extra cost to you. See our{' '}
          <Link href="/affiliate-disclosure">Affiliate Disclosure</Link> for details.
        </p>
        <h2>Third-party services</h2>
        <p>
          We may use third-party services (such as analytics providers or content delivery networks)
          that process data on our behalf under their own privacy policies.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent to{' '}
          <a href="mailto:hello@nextmatchnews.com">hello@nextmatchnews.com</a>.
        </p>
      </Prose>
    </Container>
  )
}
