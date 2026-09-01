import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { externalIdField } from '../fields/externalIdField'
import { slugField } from '../fields/slugField'

export const Players: CollectionConfig = {
  slug: 'players',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'team', 'position', 'nationality'],
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
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      admin: {
        description: 'Leave blank for a free agent.',
      },
    },
    {
      name: 'position',
      type: 'text',
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
      name: 'bio',
      type: 'textarea',
    },
    externalIdField({ unique: false }),
  ],
}
