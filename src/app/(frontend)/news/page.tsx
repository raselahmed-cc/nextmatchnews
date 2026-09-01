import type { Metadata } from 'next'
import Link from 'next/link'

import { ArticleCard } from '@/components/ArticleCard'
import { Container } from '@/components/ui/Container'
import { getPublishedArticles } from '@/lib/data'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'News',
  description: 'The latest football, NFL, and boxing news.',
  alternates: { canonical: '/news' },
}

const PAGE_SIZE = 12

export default async function NewsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { docs: articles, totalPages, hasNextPage, hasPrevPage } = await getPublishedArticles({
    limit: PAGE_SIZE,
    page,
  })

  return (
    <Container className="py-10">
      <h1 className="mb-8 text-3xl font-extrabold text-ink">News</h1>

      {articles.length === 0 ? (
        <p className="text-muted">No articles published yet. Check back soon.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4 text-sm font-semibold">
          {hasPrevPage ? (
            <Link href={`/news?page=${page - 1}`} className="text-accent-dark hover:underline">
              Previous
            </Link>
          ) : null}
          <span className="text-muted">
            Page {page} of {totalPages}
          </span>
          {hasNextPage ? (
            <Link href={`/news?page=${page + 1}`} className="text-accent-dark hover:underline">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </Container>
  )
}
