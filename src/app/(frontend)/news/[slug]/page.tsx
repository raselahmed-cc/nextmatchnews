import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { ArticleCard } from '@/components/ArticleCard'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MediaImage } from '@/components/MediaImage'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { Prose } from '@/components/ui/Prose'
import { Section } from '@/components/ui/Section'
import {
  getAllPublishedArticleSlugs,
  getArticleBySlug,
  getRelatedArticles,
} from '@/lib/data'
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

  const related = article.category
    ? await getRelatedArticles(article.category.id, article.id, 3)
    : []

  const jsonLd = getNewsArticleJsonLd(article)

  return (
    <Container className="py-8">
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

      <article className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-col gap-3">
          {article.category ? <Badge>{article.category.name}</Badge> : null}
          <h1 className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{article.title}</h1>
          <p className="text-lg text-muted">{article.excerpt}</p>
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

        <div className="mb-8 aspect-[16/9] overflow-hidden rounded-lg bg-surface-alt">
          <MediaImage media={article.featuredImage} priority />
        </div>

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

      {related.length > 0 ? (
        <Section title="Related Articles">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((relatedArticle) => (
              <ArticleCard key={relatedArticle.id} article={relatedArticle} />
            ))}
          </div>
        </Section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Container>
  )
}
