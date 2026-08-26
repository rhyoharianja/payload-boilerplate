import type { BlockRow } from '@/blocks/BlockRenderer'

export type PageDoc = {
  layout?: BlockRow[]
  seo?: { description?: string; title?: string }
  slug: string
  title: string
}

/**
 * Klien data ke Payload — REST API bawaan, tanpa endpoint khusus.
 *
 * Tidak ada lapisan normalisasi: yang diambil adalah dokumen apa adanya, dan
 * `layout`-nya array blocks yang langsung bisa dirender. Endpoint perantara hanya
 * akan menjadi bentuk ketiga yang harus dijaga tetap sinkron dengan dua lainnya.
 */
const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001'

const query = (slug: string, draft: boolean) =>
  `${CMS_URL}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=2${
    draft ? '&draft=true' : ''
  }`

type NextInit = RequestInit & { next?: { revalidate?: number; tags?: string[] } }

/**
 * Halaman terbit. SENGAJA tanpa parameter draft.
 *
 * Satu fungsi dengan flag `isDraft` cepat atau lambat akan dipanggil dari route
 * publik dengan flag menyala. Memisahkannya secara fisik membuat kebocoran itu
 * mustahil, bukan sekadar tidak disarankan.
 */
export const getPublishedPage = async (slug: string): Promise<null | PageDoc> => {
  const init: NextInit = {
    // Tag per halaman supaya publish hanya memurge yang berubah.
    next: { revalidate: 3600, tags: [`pages:${slug}`] },
  }
  const res = await fetch(query(slug, false), init)
  if (!res.ok) {
    return null
  }
  const json = (await res.json()) as { docs?: PageDoc[] }
  return json.docs?.[0] ?? null
}

/** Halaman draft. Hanya dipanggil dari route /preview. */
export const getDraftPage = async (slug: string, cookie: string): Promise<null | PageDoc> => {
  const res = await fetch(query(slug, true), {
    // Draft tidak boleh masuk cache mana pun.
    cache: 'no-store',
    headers: { cookie },
  })
  if (!res.ok) {
    return null
  }
  const json = (await res.json()) as { docs?: PageDoc[] }
  return json.docs?.[0] ?? null
}
