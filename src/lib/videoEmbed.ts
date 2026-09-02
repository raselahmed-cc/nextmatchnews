// Parses a YouTube or Vimeo URL into an embeddable iframe src. Returns null
// for anything else — the render component falls back to a plain link
// rather than guessing at other providers' embed formats.
export const getVideoEmbedUrl = (url: string): string | null => {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\./, '')

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    if (parsed.pathname === '/watch') {
      const id = parsed.searchParams.get('v')
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    if (parsed.pathname.startsWith('/embed/')) {
      return `https://www.youtube-nocookie.com${parsed.pathname}`
    }
    if (parsed.pathname.startsWith('/shorts/')) {
      const id = parsed.pathname.split('/')[2]
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    return null
  }

  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1)
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
  }

  if (host === 'vimeo.com') {
    const id = parsed.pathname.split('/').filter(Boolean)[0]
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null
  }

  return null
}

// YouTube serves a predictable static thumbnail per video ID, so a preview
// image needs no API call. Vimeo has no equivalent unauthenticated URL
// pattern (its thumbnails require an oEmbed request) — callers should fall
// back to a manual thumbnail upload or a placeholder for anything else.
export const getVideoThumbnailUrl = (url: string): string | null => {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\./, '')
  let id: string | null = null

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    if (parsed.pathname === '/watch') {
      id = parsed.searchParams.get('v')
    } else if (parsed.pathname.startsWith('/shorts/')) {
      id = parsed.pathname.split('/')[2] || null
    } else if (parsed.pathname.startsWith('/embed/')) {
      id = parsed.pathname.split('/')[2] || null
    }
  } else if (host === 'youtu.be') {
    id = parsed.pathname.slice(1) || null
  }

  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}
