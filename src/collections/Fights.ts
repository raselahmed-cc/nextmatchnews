import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { formatSlug } from '../fields/slugField'

export const Fights: CollectionConfig = {
  slug: 'fights',
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['fighterA', 'fighterB', 'event', 'status'],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'fight-events',
      required: true,
    },
    {
      name: 'fighterA',
      type: 'relationship',
      relationTo: 'fighters',
      required: true,
    },
    {
      name: 'fighterB',
      type: 'relationship',
      relationTo: 'fighters',
      required: true,
    },
    {
      name: 'weightClass',
      type: 'text',
    },
    {
      name: 'scheduledRounds',
      type: 'number',
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
      name: 'winner',
      type: 'relationship',
      relationTo: 'fighters',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.status === 'finished',
      },
    },
    {
      name: 'method',
      type: 'select',
      options: [
        { label: 'KO', value: 'ko' },
        { label: 'TKO', value: 'tko' },
        { label: 'Decision (Unanimous)', value: 'decision-unanimous' },
        { label: 'Decision (Split)', value: 'decision-split' },
        { label: 'Decision (Majority)', value: 'decision-majority' },
        { label: 'Submission', value: 'submission' },
        { label: 'Draw', value: 'draw' },
        { label: 'No Contest', value: 'no-contest' },
        { label: 'Disqualification', value: 'disqualification' },
      ],
      admin: {
        position: 'sidebar',
        condition: (data) => data?.status === 'finished',
        description: '"Submission" is here for future MMA/UFC reuse.',
      },
    },
    {
      name: 'titles',
      type: 'text',
      admin: {
        description: 'Title(s) on the line, e.g. "WBC Heavyweight Title". Leave blank if none.',
      },
    },
    {
      name: 'preview',
      type: 'richText',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-generated from the two fighters and the event date.',
      },
      hooks: {
        beforeValidate: [
          async ({ data, req, originalDoc }) => {
            const fighterARef = data?.fighterA ?? originalDoc?.fighterA
            const fighterBRef = data?.fighterB ?? originalDoc?.fighterB
            const eventRef = data?.event ?? originalDoc?.event

            if (!fighterARef || !fighterBRef || !eventRef) {
              return originalDoc?.slug
            }

            const fighterAId = typeof fighterARef === 'object' ? fighterARef.id : fighterARef
            const fighterBId = typeof fighterBRef === 'object' ? fighterBRef.id : fighterBRef
            const eventId = typeof eventRef === 'object' ? eventRef.id : eventRef

            const [fighterA, fighterB, event] = await Promise.all([
              req.payload.findByID({ collection: 'fighters', id: fighterAId }),
              req.payload.findByID({ collection: 'fighters', id: fighterBId }),
              req.payload.findByID({ collection: 'fight-events', id: eventId }),
            ])

            const date = new Date(event.date).toISOString().slice(0, 10)

            return formatSlug(`${fighterA.name}-vs-${fighterB.name}-${date}`)
          },
        ],
      },
    },
  ],
}
