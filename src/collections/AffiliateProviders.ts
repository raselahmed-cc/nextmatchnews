import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { slugField } from '../fields/slugField'

// The single source of truth for every streaming/broadcast provider's real
// destination URL — CLAUDE.md §27's "centrally managed affiliate
// configuration." Guide content (HowToWatchGuides) only ever relates to a
// provider by id; the real URL is never pasted into content, and only
// resolves server-side when /go/[slug] redirects (see src/app/go/[slug]/
// route.ts) — so it never appears in rendered HTML either.
export const AffiliateProviders: CollectionConfig = {
  slug: 'affiliate-providers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'ctaLabel', 'isAffiliate'],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "DAZN", "ESPN+", "Paramount+"',
      },
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'The real destination URL (may already carry an affiliate tracking tag).',
      },
    },
    {
      name: 'ctaLabel',
      type: 'select',
      required: true,
      defaultValue: 'Where to Watch',
      options: ['Watch Live', 'Where to Watch', 'Check Streaming Options', 'View Live Sports Options'],
      admin: {
        description:
          'Limited to these options on purpose — CLAUDE.md §26 bans deceptive CTAs like "WATCH FREE"; a select field makes that impossible to type in by accident.',
      },
    },
    {
      name: 'isAffiliate',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Uncheck for a genuinely free/non-monetized broadcaster — keeps the affiliate disclosure accurate rather than overclaiming.',
      },
    },
    {
      name: 'description',
      type: 'text',
      admin: {
        description: 'Short blurb, e.g. "Official global streaming home of UFC".',
      },
    },
  ],
}
