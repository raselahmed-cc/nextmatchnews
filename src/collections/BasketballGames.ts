import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { externalIdField } from '../fields/externalIdField'
import { formatSlug } from '../fields/slugField'

// Covers the NBA for now; sport-tagged generically enough (via `competition
// -> sport`) that other basketball leagues (WNBA, EuroLeague, ...) can
// reuse this same collection later — the same pattern nfl-games uses for
// NFL vs NCAA Football.
export const BasketballGames: CollectionConfig = {
  slug: 'basketball-games',
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['homeTeam', 'awayTeam', 'competition', 'tipoffTime', 'status'],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'homeTeam',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
    },
    {
      name: 'awayTeam',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
    },
    {
      name: 'competition',
      type: 'relationship',
      relationTo: 'competitions',
      required: true,
    },
    {
      name: 'tipoffTime',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'venue',
      type: 'text',
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
      name: 'homeScore',
      type: 'number',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.status === 'live' || data?.status === 'finished',
      },
    },
    {
      name: 'awayScore',
      type: 'number',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.status === 'live' || data?.status === 'finished',
      },
    },
    {
      name: 'season',
      type: 'text',
      admin: {
        description: 'e.g. "2025-2026"',
      },
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
        description: 'Auto-generated from the two teams and tip-off date.',
      },
      hooks: {
        beforeValidate: [
          async ({ data, req, originalDoc }) => {
            const homeTeamRef = data?.homeTeam ?? originalDoc?.homeTeam
            const awayTeamRef = data?.awayTeam ?? originalDoc?.awayTeam
            const tipoffTime = data?.tipoffTime ?? originalDoc?.tipoffTime

            if (!homeTeamRef || !awayTeamRef || !tipoffTime) {
              return originalDoc?.slug
            }

            const homeTeamId = typeof homeTeamRef === 'object' ? homeTeamRef.id : homeTeamRef
            const awayTeamId = typeof awayTeamRef === 'object' ? awayTeamRef.id : awayTeamRef

            const [homeTeam, awayTeam] = await Promise.all([
              req.payload.findByID({ collection: 'teams', id: homeTeamId }),
              req.payload.findByID({ collection: 'teams', id: awayTeamId }),
            ])

            const date = new Date(tipoffTime).toISOString().slice(0, 10)

            return formatSlug(`${homeTeam.name}-vs-${awayTeam.name}-${date}`)
          },
        ],
      },
    },
    externalIdField(),
  ],
}
