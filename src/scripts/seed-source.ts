/**
 * Data awal seed, diambil dari frontend lewat HTTP.
 *
 * Sebelumnya berkas-berkas ini di-import langsung dari `../NEXT-REACTBANK`. Itu
 * membuat CMS mustahil di-clone sendirian. Sekarang ia cukup tahu ALAMAT
 * frontend — dan alamat itu memang sudah harus diketahui untuk CORS, Live
 * Preview, dan pratinjau blok.
 *
 * Konsekuensinya jujur: `pnpm seed:content` kini MEMBUTUHKAN frontend hidup.
 * Itu bukan beban tambahan yang berarti — data seed-nya memang milik frontend,
 * dan mengambilnya dari sumber yang sedang berjalan berarti tidak akan pernah
 * ada versi basi yang tersimpan diam-diam di sini.
 */

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3030'

export type SeedSource = {
  blockDefaults: Record<string, Record<string, unknown>>
  content: {
    authors: { bio: string; name: string; role: string; slug: string }[]
    caseStudies: {
      client: string
      industry: string
      metrics: { label: string; value: string }[]
      slug: string
      summary: string
      tags: string[]
      title: string
    }[]
    categories: { description: string; name: string; slug: string }[]
    faqs: { answer: string; question: string }[]
    team: { focus: string; name: string; role: string }[]
  }
  pages: {
    aboutTimeline: { detail: string; title: string; year: string }[]
    aboutValues: { accent: string; description: string; title: string }[]
    applySteps: { detail: string; title: string }[]
    calculatorNotes: { detail: string; title: string }[]
    disclaimerClauses: { body: string; title: string }[]
    partnerTracks: { accent: string; description: string; title: string }[]
    platformCapabilities: { accent: string; description: string; title: string }[]
    platformSnippet: string
    securityCertifications: { detail: string; title: string }[]
    securityControls: { accent: string; description: string; title: string }[]
    servicePlans: {
      features: string[]
      highlight?: boolean
      name: string
      note: string
      price: string
      variant: string
    }[]
  }
  site: {
    footerNav: { links: { href: string; label: string }[]; title: string }[]
    mainNav: {
      children?: { description?: string; href: string; label: string }[]
      href?: string
      label: string
    }[]
    megaMenu: { items: { description?: string; href: string; label: string }[]; label: string }[]
    posts: {
      authorSlug: string
      categorySlug: string
      date: string
      excerpt: string
      readingTime: string
      slug: string
      title: string
    }[]
    site: { address: string; email: string; name: string; phone: string; tagline: string }
  }
}

/**
 * Ambil data seed. Melempar dengan pesan yang bisa ditindaklanjuti bila frontend
 * tidak menjawab — seed yang diam-diam melewati separuh isinya jauh lebih mahal
 * daripada seed yang berhenti dan mengatakan alasannya.
 */
export const fetchSeedSource = async (): Promise<SeedSource> => {
  const url = `${FRONTEND_URL}/api/seed-data`

  let res: Response
  try {
    res = await fetch(url)
  } catch (error) {
    throw new Error(
      `Tidak bisa menghubungi frontend di ${url} — ${
        error instanceof Error ? error.message : String(error)
      }. Jalankan frontend lebih dulu, atau setel FRONTEND_URL.`,
    )
  }

  if (!res.ok) {
    throw new Error(`Frontend membalas ${res.status} untuk ${url}.`)
  }

  return (await res.json()) as SeedSource
}
