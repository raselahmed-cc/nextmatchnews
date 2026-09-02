'use client'

import { useState } from 'react'

import type { PopulatedHighlight } from '@/lib/highlights'
import { getVideoEmbedUrl, getVideoThumbnailUrl } from '@/lib/videoEmbed'
import { getMediaURL } from '@/lib/seo'
import { cn } from '@/lib/cn'

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M6 4l10 6-10 6V4z" fill="currentColor" />
  </svg>
)

// The one interactive piece on an otherwise server-rendered page — clicking
// the thumbnail swaps it for an embedded player in place (no dedicated
// detail page; a video clip doesn't warrant one — CLAUDE.md §23).
export const HighlightCard = ({ highlight }: { highlight: PopulatedHighlight }) => {
  const [playing, setPlaying] = useState(false)

  const embedUrl = getVideoEmbedUrl(highlight.videoUrl)
  const thumbnailUrl = getMediaURL(highlight.thumbnail) || getVideoThumbnailUrl(highlight.videoUrl)

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3">
      <div className="aspect-video overflow-hidden rounded-md bg-brand">
        {playing && embedUrl ? (
          <iframe
            src={embedUrl}
            title={highlight.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            disabled={!embedUrl}
            className={cn(
              'group relative flex h-full w-full items-center justify-center',
              !embedUrl && 'cursor-not-allowed',
            )}
            aria-label={`Play video: ${highlight.title}`}
          >
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-dark" />
            )}
            <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-brand shadow-lg transition-transform group-hover:scale-105">
              <PlayIcon />
            </span>
          </button>
        )}
      </div>
      <p className="line-clamp-2 text-sm font-semibold text-ink">{highlight.title}</p>
    </div>
  )
}
