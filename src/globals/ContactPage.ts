import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { seoFields } from '../fields/seoFields'

// A Global, not a Collection — there is exactly one /contact page, never a
// list of them, so a singleton settings doc is the correct fit (unlike
// Articles/HowToWatchGuides/etc., which are genuinely many documents).
export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  label: 'Contact Page',
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Contact Us',
    },
    {
      name: 'intro',
      type: 'richText',
      required: true,
    },
    {
      name: 'contactEmail',
      type: 'email',
      required: true,
      defaultValue: 'hello@nextmatchnews.com',
      admin: {
        description: 'Shown on the page, and used as the reply-to address context for submissions.',
      },
    },
    seoFields(),
  ],
}
