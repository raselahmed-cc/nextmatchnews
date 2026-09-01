import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { ContactForm } from '@/components/ContactForm'
import { Container } from '@/components/ui/Container'
import { Prose } from '@/components/ui/Prose'
import { getContactPage } from '@/lib/contact'
import { richTextConverters } from '@/lib/richTextConverters'
import { getServerSideURL, siteConfig } from '@/lib/seo'

export const revalidate = 60

export const generateMetadata = async (): Promise<Metadata> => {
  const page = await getContactPage()
  const title = page.seoTitle || page.heading || 'Contact'
  const description = page.seoDescription || `Get in touch with the ${siteConfig.name} team.`
  const canonical = page.canonicalURL || `${getServerSideURL()}/contact`

  return {
    title,
    description,
    alternates: { canonical },
  }
}

export default async function ContactPage() {
  const page = await getContactPage()

  return (
    <Container className="py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <Prose>
          <h1>{page.heading}</h1>
          {page.intro ? <RichText data={page.intro} converters={richTextConverters} /> : null}
          <p>
            You can also reach us directly at{' '}
            <a href={`mailto:${page.contactEmail}`}>{page.contactEmail}</a>.
          </p>
        </Prose>

        <ContactForm />
      </div>
    </Container>
  )
}
