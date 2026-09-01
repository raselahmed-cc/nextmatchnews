import Link from 'next/link'

import { ArticleCard } from '@/components/ArticleCard'
import { MediaImage } from '@/components/MediaImage'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { getPublishedArticles } from '@/lib/data'

export const revalidate = 60

const exploreLinks = [
  {
    title: 'Football',
    href: '/football',
    description: 'Premier League, Champions League, and more.',
  },
  { title: 'NFL', href: '/nfl', description: 'Schedules, scores, and standings.' },
  { title: 'Boxing', href: '/boxing', description: 'Fight cards, results, and rankings.' },
  { title: 'How to Watch', href: '/how-to-watch', description: 'Streaming and broadcast guides.' },
]

export default async function HomePage() {
  const { docs: articles } = await getPublishedArticles({ limit: 7 })
  const [hero, ...rest] = articles

  if (!hero) {
    return (
      <Container className="flex flex-col items-start gap-3 py-20">
        <h1 className="text-3xl font-extrabold text-ink">No articles published yet</h1>
        <p className="max-w-lg text-muted">
          Once you publish your first article in the admin panel, it will appear here.
        </p>
        <Link href="/admin" className="font-semibold text-accent-dark hover:underline">
          Go to admin panel
        </Link>
      </Container>
    )
  }

  return (
    <>
      <Section className="pt-8">
        <article className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <Link
            href={`/news/${hero.slug}`}
            className="block aspect-[16/10] overflow-hidden rounded-lg bg-surface-alt"
          >
            <MediaImage media={hero.featuredImage} priority />
          </Link>
          <div className="flex flex-col gap-3">
            {hero.category ? (
              <Link href={`/categories/${hero.category.slug}`}>
                <Badge>{hero.category.name}</Badge>
              </Link>
            ) : null}
            <h1 className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
              <Link href={`/news/${hero.slug}`} className="hover:text-accent-dark">
                {hero.title}
              </Link>
            </h1>
            <p className="text-base text-muted">{hero.excerpt}</p>
            {hero.author ? (
              <Link href={`/authors/${hero.author.slug}`} className="text-sm font-semibold text-ink hover:text-accent-dark">
                By {hero.author.name}
              </Link>
            ) : null}
          </div>
        </article>
      </Section>

      {rest.length > 0 ? (
        <Section title="Latest News" action={<Link href="/news" className="text-sm font-semibold text-accent-dark hover:underline">View all</Link>}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="Explore" className="bg-surface-alt">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {exploreLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <span className="font-display text-lg font-bold text-ink">{link.title}</span>
              <span className="text-sm text-muted">{link.description}</span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  )
}
