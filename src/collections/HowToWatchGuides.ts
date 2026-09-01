import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { seoFields } from '../fields/seoFields'
import { slugField } from '../fields/slugField'

export const HowToWatchGuides: CollectionConfig = {
  slug: 'how-to-watch-guides',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sport', 'region', '_status', 'publishedAt'],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true

      return {
        _status: {
          equals: 'published',
        },
      }
    },
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "How to Watch NFL Games in the UK"',
      },
    },
    slugField({ fieldToUse: 'title' }),
    {
      name: 'sport',
      type: 'relationship',
      relationTo: 'sports',
      admin: {
        description: 'Leave blank for a general/multi-sport guide.',
      },
    },
    {
      name: 'competition',
      type: 'relationship',
      relationTo: 'competitions',
      admin: {
        description: 'Optional — for a competition-specific guide, e.g. "How to Watch the Premier League".',
      },
    },
    {
      name: 'region',
      type: 'text',
      admin: {
        description: 'e.g. "United States", "United Kingdom", "Worldwide" — streaming access is region-dependent.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      maxLength: 300,
      admin: {
        description:
          'Short summary shown in guide listings, and used as a fallback meta description when no SEO description is set.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'streamingOptions',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Where viewers can actually watch — each row links to a centrally managed provider.',
      },
      fields: [
        {
          name: 'provider',
          type: 'relationship',
          relationTo: 'affiliate-providers',
          required: true,
        },
        {
          name: 'note',
          type: 'text',
          admin: {
            description: 'Optional context, e.g. "Includes NFL Sunday Ticket".',
          },
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
        description: 'Highlight this guide on the How to Watch hub page.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }

            return value
          },
        ],
      },
    },
    seoFields(),
  ],
}
