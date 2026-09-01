import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { slugField } from '../fields/slugField'

export const FightEvents: CollectionConfig = {
  slug: 'fight-events',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sport', 'date', 'status', 'promotion'],
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
        description: 'e.g. "Fury vs Usyk 2"',
      },
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'sport',
      type: 'relationship',
      relationTo: 'sports',
      required: true,
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
      name: 'venue',
      type: 'text',
      admin: {
        description: 'The arena, e.g. "Kingdom Arena"',
      },
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'City/region, e.g. "Riyadh, Saudi Arabia"',
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
      name: 'promotion',
      type: 'text',
      admin: {
        description: 'e.g. "Top Rank", "Matchroom Boxing"',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
