import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { seoFields } from '../fields/seoFields'
import { slugField } from '../fields/slugField'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'author', '_status', 'publishedAt'],
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
    },
    slugField({ fieldToUse: 'title' }),
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      maxLength: 300,
      admin: {
        description:
          'Short summary shown in article listings, and used as a fallback meta description when no SEO description is set.',
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
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: 'Type a tag name and press Enter — matches an existing tag, or creates a new one on the spot.',
        components: {
          Field: {
            path: '@/components/admin/TagsField',
            exportName: 'TagsField',
          },
        },
      },
    },
    {
      name: 'relatedTeams',
      type: 'relationship',
      relationTo: 'teams',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedCompetition',
      type: 'relationship',
      relationTo: 'competitions',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedMatch',
      type: 'relationship',
      relationTo: 'football-matches',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedNFLGame',
      type: 'relationship',
      relationTo: 'nfl-games',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedFighters',
      type: 'relationship',
      relationTo: 'fighters',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedFightEvent',
      type: 'relationship',
      relationTo: 'fight-events',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedFight',
      type: 'relationship',
      relationTo: 'fights',
      admin: {
        position: 'sidebar',
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
