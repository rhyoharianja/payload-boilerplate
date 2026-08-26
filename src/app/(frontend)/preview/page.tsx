import { headers } from 'next/headers'

import { BlockRenderer } from '@/blocks/BlockRenderer'
import { getDraftPage } from '@/lib/cms'

import '../styles.css'
import { RefreshOnSave } from './RefreshOnSave'

/**
 * Route preview — dimuat di dalam iframe Live Preview panel admin.
 *
 * Bedanya dari route publik hanya dua: membaca DRAFT, dan tidak pernah di-cache
 * maupun diindeks. Sisanya melewati komponen block yang sama persis.
 */

// `dynamic` harus LITERAL: Next membacanya secara statis saat build, jadi nilai
// dari variabel tidak dikenali dan route ini boleh di-cache — artinya draft bisa
// tersaji dari cache.
export const dynamic = 'force-dynamic'

export const metadata = { robots: { follow: false, index: false } }

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>
}) {
  const { slug = 'home' } = await searchParams
  const cookie = (await headers()).get('cookie') ?? ''
  const page = await getDraftPage(slug, cookie)

  if (!page) {
    return (
      <main className="p-10">
        <p className="text-muted-foreground">
          Draft tidak bisa dibaca. Pastikan Anda login di panel admin pada domain yang sama —
          membaca draft memang butuh autentikasi.
        </p>
      </main>
    )
  }

  return (
    <main>
      <RefreshOnSave />
      <BlockRenderer blocks={page.layout} />
    </main>
  )
}
