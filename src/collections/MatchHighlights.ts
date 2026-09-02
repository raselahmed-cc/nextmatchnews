import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { getVideoEmbedUrl } from '../lib/videoEmbed'

// Supplementary video-clip content (goal reels, fight recaps) — deliberately
// simpler than Articles.ts: no drafts/versions, since this isn't an
// editorial workflow. `sport` is built generically (not football-only)
// since the same pattern will likely be wanted on /nfl and /boxing later.
export const MatchHighlights: CollectionConfig = {
  slug: 'match-highlights',
  labels: {
    singular: 'Match Highlight',
    plural: 'Match Highlights',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sport', 'publishedAt'],
  },
  access: {
    read: () => true,
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
        description: 'e.g. "Arsenal 3-1 Chelsea — Highlights & Goals"',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'A YouTube or Vimeo video URL, e.g. https://www.youtube.com/watch?v=... or https://vimeo.com/...',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || !value) return 'A video URL is required.'
        return getVideoEmbedUrl(value) ? true : 'Enter a valid YouTube or Vimeo video URL.'
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional. YouTube videos get a thumbnail automatically — upload one here to override it, or if the video is hosted on Vimeo (which has no automatic thumbnail).',
      },
    },
    {
      name: 'sport',
      type: 'relationship',
      relationTo: 'sports',
      required: true,
      admin: {
        description: 'Which sport hub page(s) this highlight appears on.',
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
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
