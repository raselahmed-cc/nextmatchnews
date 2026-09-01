import Link from 'next/link'

import { getServerSideURL } from '@/lib/seo'

export type Crumb = {
  label: string
  href: string
}

export const Breadcrumbs = ({ items }: { items: Crumb[] }) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${getServerSideURL()}${item.href}`,
    })),
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-1.5">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {index === items.length - 1 ? (
              <span aria-current="page" className="font-medium text-ink">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-ink">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  )
}
