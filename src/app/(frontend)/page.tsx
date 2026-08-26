import { notFound } from 'next/navigation'

import { BlockRenderer } from '@/blocks/BlockRenderer'
import { getPublishedPage } from '@/lib/cms'

import './styles.css'

/**
 * Halaman utama — slug `home`.
 *
 * Dipisah dari catch-all karena Next tidak mengizinkan `page.tsx` dan
 * `[[...slug]]` hidup bersama di level yang sama.
 */
export default async function HomePage() {
  const page = await getPublishedPage('home')

  if (!page) {
    notFound()
  }

  return (
    <main>
      <BlockRenderer blocks={page.layout} />
    </main>
  )
}
