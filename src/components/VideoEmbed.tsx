import { getVideoEmbedUrl } from '@/lib/videoEmbed'

export const VideoEmbed = ({ url, caption }: { url: string; caption?: string | null }) => {
  const embedUrl = getVideoEmbedUrl(url)

  if (!embedUrl) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent-dark underline">
        Watch video
      </a>
    )
  }

  return (
    <figure className="my-6">
      <div className="aspect-video overflow-hidden rounded-lg bg-surface-alt">
        <iframe
          src={embedUrl}
          title={caption || 'Embedded video'}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {caption ? <figcaption className="mt-2 text-center text-sm text-muted">{caption}</figcaption> : null}
    </figure>
  )
}
