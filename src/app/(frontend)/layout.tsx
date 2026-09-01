import type { Metadata } from 'next'
import { Inter, Oswald } from 'next/font/google'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { getServerSideURL, siteConfig } from '@/lib/seo'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const oswald = Oswald({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-oswald' })

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
