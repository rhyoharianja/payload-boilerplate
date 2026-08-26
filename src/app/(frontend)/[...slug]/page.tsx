import type { Metadata } from 'next'

import { notFound } from 'next/navigation'

import { BlockRenderer } from '@/blocks/BlockRenderer'
import { getPublishedPage } from '@/lib/cms'

import '../styles.css'

type Params = { params: Promise<{ slug: string[] }> }

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const { slug } = await params
  const page = await getPublishedPage(slug.join('/'))
  return { description: page?.seo?.description, title: page?.seo?.title ?? page?.title }
}

export default async function CmsPage({ params }: Params) {
  const { slug } = await params
  const page = await getPublishedPage(slug.join('/'))

  if (!page) {
    notFound()
  }

  return (
    <main>
      <BlockRenderer
        blocks={page.layout}
        // Fail-soft: blok yang belum dikenal frontend ini dilewatkan, bukan
        // meruntuhkan halaman. Admin dan frontend adalah dua deploy terpisah, jadi
        // skew versi pasti terjadi — dicatat supaya terlihat, tidak sunyi.
        onUnknown={(t) => console.warn(`[blocks] blockType tidak dikenal: ${t}`)}
      />
    </main>
  )
}
