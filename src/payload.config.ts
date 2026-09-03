import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { BlocksFeature, FixedToolbarFeature, HeadingFeature, lexicalEditor, UploadFeature } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { VideoEmbedBlock } from './blocks/VideoEmbedBlock'
import { AffiliateProviders } from './collections/AffiliateProviders'
import { Articles } from './collections/Articles'
import { Authors } from './collections/Authors'
import { Categories } from './collections/Categories'
import { BasketballGames } from './collections/BasketballGames'
import { Competitions } from './collections/Competitions'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { F1Races } from './collections/F1Races'
import { FightEvents } from './collections/FightEvents'
import { Fighters } from './collections/Fighters'
import { Fights } from './collections/Fights'
import { FootballMatches } from './collections/FootballMatches'
import { HowToWatchGuides } from './collections/HowToWatchGuides'
import { MatchHighlights } from './collections/MatchHighlights'
import { Media } from './collections/Media'
import { NFLGames } from './collections/NFLGames'
import { Players } from './collections/Players'
import { RugbyMatches } from './collections/RugbyMatches'
import { Sports } from './collections/Sports'
import { Tags } from './collections/Tags'
import { Teams } from './collections/Teams'
import { Users } from './collections/Users'
import { ContactPage } from './globals/ContactPage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo#Logo',
      },
    },
  },
  // Payload's built-in "Browse by Folder" view — a real desktop-style file
  // browser (folders, subfolders, breadcrumbs, drag-and-drop, thumbnail
  // cards for uploads). Enabled per-collection below (Media.ts) rather than
  // building a custom admin component, since this is a first-party feature
  // that already does exactly this.
  folders: {},
  collections: [
    Users,
    Media,
    Authors,
    Categories,
    Tags,
    Articles,
    Sports,
    Competitions,
    Teams,
    Players,
    FootballMatches,
    NFLGames,
    RugbyMatches,
    F1Races,
    BasketballGames,
    Fighters,
    FightEvents,
    Fights,
    AffiliateProviders,
    HowToWatchGuides,
    MatchHighlights,
    ContactSubmissions,
  ],
  globals: [ContactPage],
  // Extends (not replaces) the defaults: a persistent formatting toolbar
  // (the default is a floating one that only appears on text selection —
  // easy to miss), headings constrained to h2-h4 so editors can't
  // accidentally create a second <h1> inside body content (CLAUDE.md §18
  // heading hierarchy), a `size` field on inserted images (no drag-resize
  // handles in Payload's Lexical editor — a preset dropdown is the
  // supported, upgrade-safe way to make an image render smaller/larger;
  // see src/lib/richTextConverters.tsx for how it's applied on the
  // frontend), and a video-embed block (YouTube/Vimeo) since uploading raw
  // video files only produces a download link, not a player — see
  // UploadJSXConverter in @payloadcms/richtext-lexical.
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter((feature) => feature.key !== 'heading' && feature.key !== 'upload'),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      UploadFeature({
        collections: {
          media: {
            fields: [
              {
                name: 'size',
                type: 'select',
                defaultValue: 'full',
                options: [
                  { label: 'Small', value: 'small' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Large', value: 'large' },
                  { label: 'Full Width', value: 'full' },
                ],
              },
            ],
          },
        },
      }),
      FixedToolbarFeature(),
      BlocksFeature({ blocks: [VideoEmbedBlock] }),
    ],
  }),
  // Used both for Payload's own system emails (password reset, etc. — the
  // "No email adapter provided" log line goes away once RESEND_API_KEY is
  // set) and for the contact-form notification in
  // src/app/api/contact/route.ts. Safe to boot with no key configured yet —
  // resendAdapter() doesn't validate it until an email is actually sent,
  // and that call site already handles a send failure without breaking the
  // visitor's submission.
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || '',
    defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    defaultFromName: 'NextMatchNews',
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  // Media falls back to local disk storage until S3 credentials are configured in .env.local.
  plugins: process.env.S3_BUCKET
    ? [
        s3Storage({
          collections: {
            // S3_PUBLIC_URL points file URLs at the R2 bucket's custom
            // domain (e.g. cdn.nextmatchnews.com) instead of the raw
            // <account-id>.r2.cloudflarestorage.com endpoint — that
            // endpoint is for authenticated S3 API calls (upload/delete),
            // not meant to be the public-facing image URL served to
            // visitors. Falls back to the adapter's own default (the raw
            // endpoint) if no custom domain is set yet.
            media: process.env.S3_PUBLIC_URL
              ? {
                  generateFileURL: ({ filename, prefix }) =>
                    `${process.env.S3_PUBLIC_URL}/${prefix ? `${prefix}/` : ''}${filename}`,
                }
              : true,
          },
          bucket: process.env.S3_BUCKET,
          config: {
            region: process.env.S3_REGION,
            endpoint: process.env.S3_ENDPOINT,
            forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
            },
          },
        }),
      ]
    : [],
})
