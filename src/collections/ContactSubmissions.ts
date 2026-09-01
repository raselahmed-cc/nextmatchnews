import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'

// Visitor-submitted contact form entries. Unlike every other collection in
// this project, `create` is intentionally public (anyone submitting the
// form isn't logged in) — but `read`/`update`/`delete` stay staff-only,
// since these carry a visitor's name/email/message and have no reason to
// be public.
export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['name', 'email', 'subject', 'createdAt'],
    description: 'Read-only record of what visitors submitted through /contact.',
  },
  access: {
    create: () => true,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'subject',
      type: 'text',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
  ],
}
