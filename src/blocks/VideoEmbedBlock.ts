import type { Block } from 'payload'

import { getVideoEmbedUrl } from '../lib/videoEmbed'

// Embeds a YouTube or Vimeo video inside richText content — the practical
// way to add "video" to an article without a self-hosted video pipeline
// (uploading raw video files would just become a download link; see
// UploadJSXConverter in @payloadcms/richtext-lexical, which only renders
// an <img>/<picture> for image mimetypes).
export const VideoEmbedBlock: Block = {
  slug: 'videoEmbed',
  labels: {
    singular: 'Video Embed',
    plural: 'Video Embeds',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'A YouTube or Vimeo video URL, e.g. https://www.youtube.com/watch?v=... or https://vimeo.com/...',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || !value) return 'A video URL is required.'
        return getVideoEmbedUrl(value) ? true : 'Enter a valid YouTube or Vimeo video URL.'
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
}
