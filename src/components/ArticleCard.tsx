import Link from 'next/link'

import type { PopulatedArticle } from '@/lib/data'
import { MediaImage } from './MediaImage'
import { Badge } from './ui/Badge'

const formatDate = (value: string | null | undefined) => {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const ArticleCard = ({
  article,
  priority,
}: {
  article: PopulatedArticle
  priority?: boolean
}) => (
  <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-md">
    <Link href={`/news/${article.slug}`} className="block aspect-[16/9] overflow-hidden bg-surface-alt">
      <MediaImage
        media={article.featuredImage}
        priority={priority}
        className="transition-transform duration-200 group-hover:scale-[1.03]"
      />
    </Link>
    <div className="flex flex-1 flex-col gap-2 p-4">
      {article.category ? (
        <Link href={`/categories/${article.category.slug}`}>
          <Badge>{article.category.name}</Badge>
        </Link>
      ) : null}
      <h3 className="text-lg font-bold leading-snug text-ink">
        <Link href={`/news/${article.slug}`} className="hover:text-accent-dark">
          {article.title}
        </Link>
      </h3>
      <p className="line-clamp-2 text-sm text-muted">{article.excerpt}</p>
      <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-muted">
        {article.author ? (
          <Link href={`/authors/${article.author.slug}`} className="font-medium hover:text-ink">
            {article.author.name}
          </Link>
        ) : null}
        {article.publishedAt ? (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </>
        ) : null}
      </div>
    </div>
  </article>
)
