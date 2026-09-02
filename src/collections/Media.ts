import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    // `filename` renders Payload's built-in thumbnail + filename cell, so
    // pinning it as the first column gives every row in the "All Media"
    // list a real thumbnail too (not just the By Folder grid).
    defaultColumns: ['filename', 'alt', 'caption', 'folder', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Describe the image for accessibility and SEO. Avoid generic text like "image" or "photo".',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
  folders: true,
  upload: {
    // A real generated thumbnail (sharp-resized on upload, uploaded to R2
    // alongside the original), not the browser downscaling the full-size
    // image — used for admin list/folder-browser previews (adminThumbnail)
    // and for the preview shown wherever Media is picked via a relationship
    // field, e.g. an Article's featuredImage (displayPreview).
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    displayPreview: true,
  },
}
