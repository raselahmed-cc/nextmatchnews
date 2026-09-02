import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MediaImage } from '@/components/MediaImage'
import { Badge } from '@/components/ui/Badge'
import { Prose } from '@/components/ui/Prose'
import {
  getAllPublishedArticleSlugs,
  getArticleBySlug,
  getRelatedArticles,
} from '@/lib/data'
import { getWatchGuideHrefForSport } from '@/lib/howToWatch'
import { richTextConverters } from '@/lib/richTextConverters'
import { getArticleMetadata, getNewsArticleJsonLd } from '@/lib/seo'

export const revalidate = 60

export const generateStaticParams = async () => {
  try {
    const slugs = await getAllPublishedArticleSlugs()
    return slugs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.error('Skipping article static params — database unavailable at build time:', error)
    return []
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}
  return getArticleMetadata(article)
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) notFound()

  const [related, watchHref] = await Promise.all([
    article.category ? getRelatedArticles(article.category.id, article.id, 4) : Promise.resolve([]),
    article.category ? getWatchGuideHrefForSport(article.category.slug) : Promise.resolve(null),
  ])

  const jsonLd = getNewsArticleJsonLd(article)

  return (
    // Wider than the site's default 6xl Container — a reading column plus a
    // real sidebar needs more room than the standard grid pages do.
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'News', href: '/news' },
          ...(article.category
            ? [{ label: article.category.name, href: `/categories/${article.category.slug}` }]
            : []),
          { label: article.title, href: `/news/${article.slug}` },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <div className="mb-6 aspect-[16/9] overflow-hidden rounded-lg bg-surface-alt">
            <MediaImage media={article.featuredImage} priority />
          </div>

          <header className="mb-6 flex flex-col gap-3">
            {article.category ? <Badge>{article.category.name}</Badge> : null}
            <h1 className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{article.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted">
              {article.author ? <span className="font-semibold text-ink">{article.author.name}</span> : null}
              {article.publishedAt ? (
                <>
                  <span aria-hidden="true">·</span>
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                </>
              ) : null}
            </div>
          </header>

          <Prose>
            <RichText data={article.content} converters={richTextConverters} />
          </Prose>

          {article.tags && article.tags.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag.id}>{tag.name}</Badge>
              ))}
            </div>
          ) : null}
        </article>

        <aside className="flex flex-col gap-8 lg:sticky lg:top-20 lg:self-start">
          {watchHref && article.category ? (
            <div className="rounded-lg border border-border bg-surface-alt/60 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
                Watch {article.category.name}
              </h2>
              <p className="mt-2 text-sm text-muted">
                Find live streaming and broadcast options for {article.category.name}.
              </p>
              <Link
                href={watchHref}
                className="mt-4 inline-flex items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                Where to Watch
              </Link>
            </div>
          ) : null}

          {related.length > 0 ? (
            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">Related Articles</h2>
              <div className="flex flex-col gap-4">
                {related.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.id}
                    href={`/news/${relatedArticle.slug}`}
                    className="group flex gap-3"
                  >
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-surface-alt">
                      <MediaImage
                        media={relatedArticle.featuredImage}
                        className="transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold text-ink group-hover:text-accent-dark">
                        {relatedArticle.title}
                      </p>
                      {relatedArticle.publishedAt ? (
                        <time dateTime={relatedArticle.publishedAt} className="mt-1 block text-xs text-muted">
                          {formatDate(relatedArticle.publishedAt)}
                        </time>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {article.author ? (
            <div className="rounded-lg border border-border bg-surface p-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Written By</h2>
              <Link href={`/authors/${article.author.slug}`} className="flex items-center gap-3">
                {article.author.avatar && typeof article.author.avatar === 'object' ? (
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface-alt">
                    <MediaImage media={article.author.avatar} />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-alt text-sm font-bold text-muted">
                    {article.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{article.author.name}</p>
                  <span className="text-xs text-accent-dark">View profile</span>
                </div>
              </Link>
              {article.author.bio ? <p className="mt-3 line-clamp-3 text-sm text-muted">{article.author.bio}</p> : null}
            </div>
          ) : null}
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  )
}
