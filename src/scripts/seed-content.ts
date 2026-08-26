import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'
import { buildPageSeeds } from './page-seeds'
import { fetchSeedSource } from './seed-source'

/**
 * Mengisi collection dan global dari data statis frontend.
 *
 * Sumbernya SENGAJA berkas `@fe/lib/*` yang sudah dipakai frontend, bukan
 * salinan yang diketik ulang di sini. Salinan akan menyimpang dari yang dirender
 * frontend sebagai cadangan, dan bedanya baru terlihat sebagai konten yang
 * berbeda antara sebelum dan sesudah seed.
 *
 * IDEMPOTEN: dokumen yang slug-nya sudah ada dilewati, bukan diduplikasi.
 * Skrip seed yang membuat duplikat setiap kali dijalankan hanya aman dipakai
 * sekali, dan itu justru saat paling tidak dibutuhkan.
 */

/** Payload tidak punya array string; barisnya selalu objek `{ value }`. */
const toRows = (values: readonly string[]) => values.map((value) => ({ value }))

/** Tanggal Indonesia di data statis, mis. "12 Agustus 2026", menjadi ISO. */
const BULAN = [
  'januari',
  'februari',
  'maret',
  'april',
  'mei',
  'juni',
  'juli',
  'agustus',
  'september',
  'oktober',
  'november',
  'desember',
]

const toISODate = (indonesian: string): string | undefined => {
  const [day, month, year] = indonesian.split(' ')
  const index = BULAN.indexOf((month ?? '').toLowerCase())
  if (!day || index < 0 || !year) {
    // Format tak dikenal dibiarkan kosong, bukan ditebak: tanggal yang salah
    // lebih buruk daripada tanggal yang tidak ada.
    return undefined
  }
  return new Date(Date.UTC(Number(year), index, Number(day))).toISOString()
}


/**
 * Membangun isi rich text Lexical dari daftar blok sederhana.
 *
 * Payload menyimpan rich text sebagai pohon Lexical, dan bentuknya tidak bisa
 * ditebak-tebak: node tanpa `version`, `format`, atau `direction` diterima saat
 * disimpan lalu membuat editor gagal membukanya. Jadi bentuknya ditulis lengkap
 * di satu tempat ini, bukan disebar per pemanggil.
 */
type Blok = { tag?: 'h2' | 'h3'; teks: string; tipe: 'heading' | 'kutipan' | 'paragraf' }

const teksNode = (teks: string) => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: teks,
  type: 'text',
  version: 1,
})

const lexical = (blok: Blok[]) => ({
  root: {
    children: blok.map((b) => ({
      children: [teksNode(b.teks)],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: b.tipe === 'heading' ? 'heading' : b.tipe === 'kutipan' ? 'quote' : 'paragraph',
      version: 1,
      ...(b.tipe === 'heading' ? { tag: b.tag ?? 'h2' } : {}),
    })),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    type: 'root',
    version: 1,
  },
})

/**
 * Isi artikel bawaan.
 *
 * Teks ini SEBELUMNYA tertanam di `app/blog/[slug]/page.tsx`, sehingga setiap
 * artikel menampilkan paragraf yang sama persis apa pun judulnya. Dipindahkan ke
 * sini supaya menjadi data yang bisa disunting per artikel — bukan supaya tetap
 * seragam. Paragraf pembukanya diturunkan dari ringkasan masing-masing artikel.
 */
const isiArtikel = (ringkasan: string) =>
  lexical([
    {
      teks: `${ringkasan} Tulisan ini menjabarkan alasan di baliknya, data yang kami pakai, dan apa yang berubah pada produk setelahnya.`,
      tipe: 'paragraf',
    },
    { teks: 'Masalahnya', tipe: 'heading' },
    {
      teks: 'Sebagian besar produk keuangan digital masih memindahkan proses cabang ke layar tanpa mengubah asumsi dasarnya. Nasabah tetap menunggu, tetap mengisi data yang sama dua kali, dan tetap tidak tahu kenapa pengajuannya ditolak.',
      tipe: 'paragraf',
    },
    { teks: 'Apa yang kami ubah', tipe: 'heading' },
    {
      teks: 'Kami memindahkan penilaian ke arus kas aktual, memangkas dokumen yang tidak dipakai dalam keputusan, dan menampilkan alasan penolakan secara eksplisit.',
      tipe: 'paragraf',
    },
    {
      teks: 'Transparansi menurunkan beban support lebih besar daripada penambahan agen mana pun yang pernah kami coba.',
      tipe: 'kutipan',
    },
  ])

/** Isi studi kasus bawaan; pembukanya memakai klien dan industrinya. */
const isiStudiKasus = (klien: string, industri: string, ringkasan: string) =>
  lexical([
    { teks: 'Titik awal', tipe: 'heading' },
    {
      teks: `${klien} beroperasi di sektor ${industri.toLowerCase()} dengan proses keuangan yang tumbuh tambal sulam. Setiap penambahan kanal berarti satu integrasi baru, satu berkas rekonsiliasi baru, dan satu sumber selisih baru.`,
      tipe: 'paragraf',
    },
    { teks: 'Yang kami kerjakan', tipe: 'heading' },
    { teks: ringkasan, tipe: 'paragraf' },
    { teks: 'Hasil', tipe: 'heading' },
    {
      teks: 'Metrik di bagian atas halaman ini diukur 90 hari setelah peralihan penuh, memakai definisi yang sama dengan sebelum proyek dimulai. Tidak ada penyesuaian basis perhitungan agar angkanya terlihat lebih baik.',
      tipe: 'paragraf',
    },
  ])

const seed = async () => {
  /*
   * Data seed diambil dari frontend lewat HTTP sebelum apa pun disentuh.
   *
   * Kalau frontend mati, skrip berhenti DI SINI — sebelum satu dokumen pun
   * dibuat. Seed yang berjalan separuh lebih buruk daripada seed yang gagal:
   * yang gagal jelas, yang separuh meninggalkan basis data dalam keadaan yang
   * tidak pernah dirancang siapa pun.
   */
  const source = await fetchSeedSource()
  const feAuthors = source.content.authors
  const feCaseStudies = source.content.caseStudies
  const feCategories = source.content.categories
  const feFaqs = source.content.faqs
  const feTeam = source.content.team
  const feFooterNav = source.site.footerNav
  const feMainNav = source.site.mainNav
  const feMegaMenu = source.site.megaMenu
  const fePosts = source.site.posts
  const feSite = source.site.site
  const pageSeeds = buildPageSeeds(source)

  const payload = await getPayload({ config })

  /**
   * Buat dokumen bila slug-nya belum ada; kembalikan id yang berlaku.
   *
   * Dokumen yang sudah ada TIDAK ditimpa — isinya mungkin sudah disunting orang.
   * Satu perkecualian: field yang masih kosong diisi. Tanpa itu, field yang baru
   * ditambahkan ke skema (seperti `body`) tidak akan pernah terisi di basis data
   * yang sudah pernah di-seed, dan skrip ini hanya berguna sekali seumur hidup.
   */
  const upsertBySlug = async (
    collection: 'authors' | 'case-studies' | 'categories' | 'posts',
    slug: string,
    data: Record<string, unknown>,
    isiBilaKosong: string[] = [],
  ): Promise<number | string> => {
    const found = await payload.find({
      collection,
      limit: 1,
      where: { slug: { equals: slug } },
    })

    // Lewat `unknown`: tipe dokumen Payload adalah union per collection dan tidak
    // punya index signature, jadi tidak bisa dibaca dengan nama field dinamis.
    const existing = found.docs[0] as unknown as
      | undefined
      | ({ id: number | string } & Record<string, unknown>)
    if (existing) {
      const kosong = isiBilaKosong.filter((field) => !existing[field])
      if (kosong.length > 0) {
        await payload.update({
          id: existing.id,
          collection,
          data: Object.fromEntries(kosong.map((field) => [field, data[field]])) as never,
          // Draft yang terbit tidak boleh diturunkan menjadi draft hanya karena
          // satu field diisi belakangan.
          draft: false,
        })
      }
      return existing.id
    }

    const created = await payload.create({ collection, data: { ...data, slug } as never })
    return created.id
  }

  // --- Kategori dan penulis lebih dulu: artikel merujuk keduanya. ---
  const categoryId = new Map<string, number | string>()
  for (const category of feCategories) {
    categoryId.set(
      category.slug,
      await upsertBySlug('categories', category.slug, {
        description: category.description,
        name: category.name,
      }),
    )
  }

  const authorId = new Map<string, number | string>()
  for (const author of feAuthors) {
    authorId.set(
      author.slug,
      await upsertBySlug('authors', author.slug, {
        bio: author.bio,
        name: author.name,
        role: author.role,
      }),
    )
  }

  for (const post of fePosts) {
    await upsertBySlug('posts', post.slug, {
      _status: 'published',
      author: authorId.get(post.authorSlug),
      category: categoryId.get(post.categorySlug),
      body: isiArtikel(post.excerpt),
      excerpt: post.excerpt,
      publishedAt: toISODate(post.date),
      readingTime: post.readingTime,
      title: post.title,
    }, ['body'])
  }

  for (const study of feCaseStudies) {
    await upsertBySlug('case-studies', study.slug, {
      _status: 'published',
      body: isiStudiKasus(study.client, study.industry, study.summary),
      client: study.client,
      industry: study.industry,
      metrics: study.metrics.map((metric) => ({ label: metric.label, value: metric.value })),
      summary: study.summary,
      tags: toRows(study.tags),
      title: study.title,
    }, ['body'])
  }

  // --- Collection tanpa slug: dicocokkan lewat field identitasnya. ---
  for (const member of feTeam) {
    const found = await payload.find({
      collection: 'team-members',
      limit: 1,
      where: { name: { equals: member.name } },
    })
    if (!found.docs[0]) {
      await payload.create({ collection: 'team-members', data: member })
    }
  }

  for (const faq of feFaqs) {
    const found = await payload.find({
      collection: 'faqs',
      limit: 1,
      where: { question: { equals: faq.question } },
    })
    if (!found.docs[0]) {
      await payload.create({ collection: 'faqs', data: faq })
    }
  }

  /*
   * Global SELALU ditimpa, tidak seperti collection.
   *
   * Global hanya punya satu dokumen, jadi tidak ada yang bisa diduplikasi — dan
   * "lewati kalau sudah ada" berarti global yang pernah tersimpan kosong tidak
   * akan pernah terisi oleh seed.
   */
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      contact: { address: feSite.address, email: feSite.email, phone: feSite.phone },
      name: feSite.name,
      tagline: feSite.tagline,
    },
  })

  await payload.updateGlobal({
    slug: 'header',
    data: {
      action: { href: '/apply-loan', label: 'Buka Rekening' },
      mainNav: feMainNav.map((item) => ({
        children: (item.children ?? []).map((child) => ({
          description: child.description,
          href: child.href,
          label: child.label,
        })),
        href: item.href,
        label: item.label,
      })),
      megaMenu: feMegaMenu.map((group) => ({
        items: group.items.map((item) => ({
          description: item.description,
          href: item.href,
          label: item.label,
        })),
        label: group.label,
      })),
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      columns: feFooterNav.map((column) => ({
        links: column.links.map((link) => ({ href: link.href, label: link.label })),
        title: column.title,
      })),
      note: `${feSite.name}. Seluruh hak cipta dilindungi.`,
    },
  })

  /*
   * Halaman: dibuat bila slug-nya belum ada, TIDAK ditimpa bila sudah.
   *
   * Layout halaman adalah hal pertama yang disunting orang setelah seed. Menimpa
   * ulang berarti setiap kali skrip ini dijalankan, susunan yang sudah dirapikan
   * di Puck kembali ke bentuk awalnya.
   *
   * `SEED_PAGES_FORCE=1` menimpanya dengan sengaja. Dipakai saat susunan bawaan
   * berubah dan halaman yang sudah ter-seed perlu mengikutinya — dan hanya itu,
   * karena ia MEMBUANG suntingan yang ada.
   */
  const forcePages = process.env.SEED_PAGES_FORCE === '1'

  for (const page of pageSeeds) {
    const found = await payload.find({
      collection: 'pages',
      limit: 1,
      where: { slug: { equals: page.slug } },
    })
    if (found.docs[0]) {
      if (!forcePages) {
        continue
      }
      await payload.update({
        id: found.docs[0].id,
        collection: 'pages',
        data: { _status: 'published', layout: page.layout as never, title: page.title },
      })
      continue
    }
    await payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        layout: page.layout as never,
        slug: page.slug,
        title: page.title,
      },
    })
  }

  payload.logger.info(`Seed konten selesai. ${pageSeeds.length} halaman diperiksa.`)
  process.exit(0)
}

void seed()
