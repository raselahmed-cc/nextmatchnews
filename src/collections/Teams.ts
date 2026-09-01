import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { externalIdField } from '../fields/externalIdField'
import { slugField } from '../fields/slugField'

export const Teams: CollectionConfig = {
  slug: 'teams',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sport', 'country'],
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
      name: 'shortName',
      type: 'text',
      admin: {
        description: 'e.g. "ARS" — used where space is tight.',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'sport',
      type: 'relationship',
      relationTo: 'sports',
      required: true,
    },
    {
      name: 'competitions',
      type: 'relationship',
      relationTo: 'competitions',
      hasMany: true,
      admin: {
        description: 'Every competition this team currently plays in.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    externalIdField({ unique: false }),
  ],
}
