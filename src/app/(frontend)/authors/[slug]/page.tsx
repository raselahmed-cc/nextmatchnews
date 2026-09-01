import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/ArticleCard'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { getAllAuthorSlugs, getAuthorBySlug, getPublishedArticles } from '@/lib/data'

export const revalidate = 60

export const generateStaticParams = async () => {
  try {
    const slugs = await getAllAuthorSlugs()
    return slugs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.error('Skipping author static params — database unavailable at build time:', error)
    return []
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) return {}

  return {
    title: author.name,
    description: author.bio || `Articles by ${author.name} on NextMatchNews.`,
    alternates: { canonical: `/authors/${author.slug}` },
  }
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)

  if (!author) notFound()

  const { docs: articles } = await getPublishedArticles({ authorId: author.id, limit: 12 })

  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: author.name, href: `/authors/${author.slug}` }]} />

      <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {author.avatar && typeof author.avatar === 'object' ? (
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-surface-alt">
            <MediaImage media={author.avatar} />
          </div>
        ) : null}
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{author.name}</h1>
          {author.bio ? <p className="mt-2 max-w-xl text-muted">{author.bio}</p> : null}
          {author.socialLinks && author.socialLinks.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-accent-dark">
              {author.socialLinks.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {link.platform}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {articles.length === 0 ? (
        <p className="text-muted">No published articles from this author yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </Container>
  )
}
