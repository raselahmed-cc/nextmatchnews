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

const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5v8A1.5 1.5 0 0 0 5.5 16h8a1.5 1.5 0 0 0 1.5-1.5V12M12 4h4v4M15.5 4.5 9 11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// "Watch on YouTube"/"Watch on Vimeo" rather than a bare host name — some
// highlight videos have off-site embedding disabled by their uploader (a
// YouTube-side restriction we can't override), so this link is the
// permanent fallback, not just a nice-to-have.
const providerLabel = (url: string): string => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') return 'Watch on YouTube'
    if (host === 'vimeo.com') return 'Watch on Vimeo'
  } catch {
    // fall through to generic label
  }
  return 'Watch original'
}

// The one interactive piece on an otherwise server-rendered page — clicking
// the thumbnail swaps it for an embedded player in place (no dedicated
// detail page; a video clip doesn't warrant one — CLAUDE.md §23).
export const HighlightCard = ({ highlight }: { highlight: PopulatedHighlight }) => {
  const [playing, setPlaying] = useState(false)

  const embedUrl = getVideoEmbedUrl(highlight.videoUrl)
  const thumbnailUrl = getMediaURL(highlight.thumbnail) || getVideoThumbnailUrl(highlight.videoUrl)

  return (
    <div className="group/card flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-video overflow-hidden rounded-md bg-brand">
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
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-dark" />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity group-hover:from-black/70" />
            <span
              className="absolute left-2 top-2 inline-flex items-center rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm"
            >
              {highlight.sport.name}
            </span>
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-brand shadow-lg ring-4 ring-white/20 transition-transform group-hover:scale-110">
              <PlayIcon />
            </span>
          </button>
        )}
      </div>
      <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{highlight.title}</p>
      <a
        href={highlight.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-muted transition-colors hover:text-accent-dark"
        onClick={(event) => event.stopPropagation()}
      >
        {providerLabel(highlight.videoUrl)}
        <ExternalLinkIcon />
      </a>
    </div>
  )
}
