import type { Media } from '@/payload-types'
import { getMediaURL } from '@/lib/seo'
import { cn } from '@/lib/cn'

export const MediaImage = ({
  media,
  className,
  priority,
}: {
  media: Media | null | undefined
  className?: string
  priority?: boolean
}) => {
  const src = getMediaURL(media)

  if (!media || !src) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={media.alt}
      width={media.width || undefined}
      height={media.height || undefined}
      loading={priority ? 'eager' : 'lazy'}
      className={cn('h-full w-full object-cover', className)}
    />
  )
}
