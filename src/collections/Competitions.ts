import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { externalIdField } from '../fields/externalIdField'
import { slugField } from '../fields/slugField'

export const Competitions: CollectionConfig = {
  slug: 'competitions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sport', 'country', 'season'],
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
      name: 'sport',
      type: 'relationship',
      relationTo: 'sports',
      required: true,
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'season',
      type: 'text',
      admin: {
        description: 'e.g. "2025/26"',
        position: 'sidebar',
      },
    },
    externalIdField({ unique: false }),
  ],
}
