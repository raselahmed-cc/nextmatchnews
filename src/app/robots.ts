import type { MetadataRoute } from 'next'

import { getServerSideURL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${getServerSideURL()}/sitemap.xml`,
  }
}
