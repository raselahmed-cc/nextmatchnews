import type { Field } from 'payload'

export const formatSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')

type SlugFieldOptions = {
  fieldToUse?: string
}

export const slugField = ({ fieldToUse = 'title' }: SlugFieldOptions = {}): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: `Auto-generated from "${fieldToUse}" if left blank. Used in the page URL — keep it short, lowercase, and hyphenated.`,
  },
  hooks: {
    beforeValidate: [
      ({ value, data, originalDoc }) => {
        if (typeof value === 'string' && value.length > 0) {
          return formatSlug(value)
        }

        const source = data?.[fieldToUse] ?? originalDoc?.[fieldToUse]

        if (typeof source === 'string' && source.length > 0) {
          return formatSlug(source)
        }

        return value
      },
    ],
  },
})
