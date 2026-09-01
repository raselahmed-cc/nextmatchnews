import type { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
import { UploadJSXConverter } from '@payloadcms/richtext-lexical/react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

import { VideoEmbed } from '@/components/VideoEmbed'

type VideoEmbedBlockFields = {
  blockName?: null | string
  blockType: 'videoEmbed'
  caption?: null | string
  url: string
}

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<VideoEmbedBlockFields>

type ImageSize = 'full' | 'large' | 'medium' | 'small'

// No drag-resize handles in Payload's Lexical editor — this preset field
// (added via UploadFeature's `collections.media.fields` in
// payload.config.ts) is the supported, upgrade-safe alternative. `full`
// matches Prose's default (img constrained to 100% width), the rest are
// centered at a reduced width.
const sizeClasses: Record<ImageSize, string> = {
  small: 'mx-auto w-1/3',
  medium: 'mx-auto w-1/2',
  large: 'mx-auto w-3/4',
  full: 'w-full',
}

// Shared by every page that renders richText content (Articles,
// HowToWatchGuides, ...) — adds the videoEmbed block and image sizing on
// top of Payload's defaults (paragraph, headings, lists, links, ...),
// which don't know how to render a custom block or a custom upload field
// on their own.
export const richTextConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: (args) => {
    const size = (args.node.fields as { size?: ImageSize } | undefined)?.size ?? 'full'
    const renderUpload = UploadJSXConverter.upload
    const image = typeof renderUpload === 'function' ? renderUpload(args) : renderUpload
    return <div className={sizeClasses[size] ?? sizeClasses.full}>{image}</div>
  },
  blocks: {
    videoEmbed: ({ node }) => <VideoEmbed url={node.fields.url} caption={node.fields.caption} />,
  },
})
