import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { trackAffiliateClick } from '@/lib/redis'

export const dynamic = 'force-dynamic'

/**
 * Central affiliate redirect — every "Watch Live"/"Where to Watch" button
 * on the site links here rather than straight to a provider, so the real
 * destination URL (AffiliateProviders.url) never appears in rendered HTML
 * and can be updated in one place (CLAUDE.md §27).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'affiliate-providers',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const provider = result.docs[0]
  if (!provider) {
    return NextResponse.json({ error: 'Unknown provider.' }, { status: 404 })
  }

  await trackAffiliateClick(slug)

  return NextResponse.redirect(provider.url, { status: 302 })
}
