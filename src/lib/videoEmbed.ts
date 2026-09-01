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
