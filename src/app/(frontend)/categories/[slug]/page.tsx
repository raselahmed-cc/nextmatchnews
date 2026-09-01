import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/ArticleCard'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Container } from '@/components/ui/Container'
import { getAllCategorySlugs, getCategoryBySlug, getPublishedArticles } from '@/lib/data'

export const revalidate = 60

export const generateStaticParams = async () => {
  try {
    const slugs = await getAllCategorySlugs()
    return slugs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.error('Skipping category static params — database unavailable at build time:', error)
    return []
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}

  return {
    title: category.name,
    description: category.description || `Latest ${category.name} news on NextMatchNews.`,
    alternates: { canonical: `/categories/${category.slug}` },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) notFound()

  const { docs: articles } = await getPublishedArticles({ categoryId: category.id, limit: 12 })

  return (
    <Container className="py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: category.name, href: `/categories/${category.slug}` },
        ]}
      />

      <h1 className="mb-2 text-3xl font-extrabold text-ink">{category.name}</h1>
      {category.description ? <p className="mb-8 max-w-xl text-muted">{category.description}</p> : null}

      {articles.length === 0 ? (
        <p className="text-muted">No published articles in this category yet.</p>
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
