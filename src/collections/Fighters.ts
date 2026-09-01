import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { slugField } from '../fields/slugField'

export const Fighters: CollectionConfig = {
  slug: 'fighters',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sport', 'weightClass', 'wins', 'losses', 'draws'],
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
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'sport',
      type: 'relationship',
      relationTo: 'sports',
      required: true,
      admin: {
        description: 'e.g. Boxing, or a future combat sport such as MMA/UFC.',
      },
    },
    {
      name: 'nationality',
      type: 'text',
    },
    {
      name: 'dateOfBirth',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'weightClass',
      type: 'text',
      admin: {
        description: 'e.g. "Heavyweight"',
      },
    },
    {
      name: 'wins',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'losses',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'draws',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'knockouts',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Wins by knockout.',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
    },
  ],
}
