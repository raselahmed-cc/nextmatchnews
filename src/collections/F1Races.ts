import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { externalIdField } from '../fields/externalIdField'
import { formatSlug } from '../fields/slugField'

// One row per Grand Prix race (the `type: "Race"` session only — practice
// and qualifying sessions aren't synced, see src/lib/sports/sync/f1.ts).
// F1 has no two-sided "match" shape, so this doesn't follow the
// FootballMatches/NFLGames/RugbyMatches pattern — results are an ordered
// list of drivers, not a home/away score.
export const F1Races: CollectionConfig = {
  slug: 'f1-races',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'competition', 'date', 'status'],
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
        description: 'Grand Prix name, e.g. "Bahrain Grand Prix"',
      },
    },
    {
      name: 'competition',
      type: 'relationship',
      relationTo: 'competitions',
      required: true,
      admin: {
        description: 'The season-level Formula 1 World Championship competition.',
      },
    },
    {
      name: 'circuitName',
      type: 'text',
    },
    {
      name: 'circuitCountry',
      type: 'text',
    },
    {
      name: 'circuitCity',
      type: 'text',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'scheduled',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Live', value: 'live' },
        { label: 'Finished', value: 'finished' },
        { label: 'Postponed', value: 'postponed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'laps',
      type: 'number',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'distance',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'season',
      type: 'text',
      admin: {
        description: 'e.g. "2025"',
      },
    },
    {
      name: 'results',
      type: 'array',
      admin: {
        description: 'Finishing order — one row per driver, populated once the race is finished.',
      },
      fields: [
        {
          name: 'driver',
          type: 'relationship',
          relationTo: 'players',
          required: true,
        },
        {
          name: 'team',
          type: 'relationship',
          relationTo: 'teams',
        },
        {
          name: 'position',
          type: 'number',
        },
        {
          name: 'time',
          type: 'text',
          admin: {
            description: 'e.g. "1:31:44.742" or "+22.457s"',
          },
        },
        {
          name: 'laps',
          type: 'number',
        },
        {
          name: 'grid',
          type: 'text',
          admin: {
            description: 'Starting grid position',
          },
        },
      ],
    },
    {
      name: 'preview',
      type: 'richText',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-generated from the race name and season.',
      },
      hooks: {
        beforeValidate: [
          ({ data, originalDoc }) => {
            const name = data?.name ?? originalDoc?.name
            const season = data?.season ?? originalDoc?.season

            if (!name || !season) {
              return originalDoc?.slug
            }

            return formatSlug(`${name}-${season}`)
          },
        ],
      },
    },
    externalIdField(),
  ],
}
