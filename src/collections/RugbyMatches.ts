import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { externalIdField } from '../fields/externalIdField'
import { formatSlug } from '../fields/slugField'

export const RugbyMatches: CollectionConfig = {
  slug: 'rugby-matches',
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['homeTeam', 'awayTeam', 'competition', 'kickoffTime', 'status'],
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
      name: 'kickoffTime',
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
      name: 'round',
      type: 'text',
      admin: {
        description: 'e.g. "Round 1"',
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
        description: 'Auto-generated from the two teams and kickoff date.',
      },
      hooks: {
        beforeValidate: [
          async ({ data, req, originalDoc }) => {
            const homeTeamRef = data?.homeTeam ?? originalDoc?.homeTeam
            const awayTeamRef = data?.awayTeam ?? originalDoc?.awayTeam
            const kickoffTime = data?.kickoffTime ?? originalDoc?.kickoffTime

            if (!homeTeamRef || !awayTeamRef || !kickoffTime) {
              return originalDoc?.slug
            }

            const homeTeamId = typeof homeTeamRef === 'object' ? homeTeamRef.id : homeTeamRef
            const awayTeamId = typeof awayTeamRef === 'object' ? awayTeamRef.id : awayTeamRef

            const [homeTeam, awayTeam] = await Promise.all([
              req.payload.findByID({ collection: 'teams', id: homeTeamId }),
              req.payload.findByID({ collection: 'teams', id: awayTeamId }),
            ])

            const date = new Date(kickoffTime).toISOString().slice(0, 10)

            return formatSlug(`${homeTeam.name}-vs-${awayTeam.name}-${date}`)
          },
        ],
      },
    },
    externalIdField(),
  ],
}
