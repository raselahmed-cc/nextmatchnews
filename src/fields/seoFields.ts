import type { Field } from 'payload'

// Shared SEO override block — same four fields used by Articles and
// HowToWatchGuides. Each falls back to a content field of the same name
// (title/description/canonical/image) when left blank; the fallback logic
// lives in src/lib/seo.ts's metadata builders, not here.
export const seoFields = (): Field => ({
  type: 'collapsible',
  label: 'SEO',
  fields: [
    {
      name: 'seoTitle',
      type: 'text',
      admin: {
        description: 'Overrides the page title. Falls back to the title above.',
      },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      admin: {
        description: 'Overrides the meta description. Falls back to the excerpt.',
      },
    },
    {
      name: 'canonicalURL',
      type: 'text',
      admin: {
        description: "Only set this if the canonical URL differs from this page's own URL.",
      },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Falls back to the featured image.',
      },
    },
  ],
})
