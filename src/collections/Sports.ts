import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { slugField } from '../fields/slugField'

export const Sports: CollectionConfig = {
  slug: 'sports',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'displayOrder'],
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
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'displayOrder',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Controls ordering when sports are listed together. Lower numbers first.',
      },
    },
  ],
}
