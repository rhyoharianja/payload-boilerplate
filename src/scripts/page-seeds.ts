import type { SeedSource } from './seed-source'

/**
 * Susunan awal dokumen `pages`, disalin dari halaman yang selama ini ditulis
 * di kode.
 *
 * Isinya mengikuti apa yang tayang hari ini, bukan versi yang "lebih baik" —
 * memindahkan halaman ke CMS dan sekaligus mengubah isinya membuat mustahil
 * membedakan perubahan yang disengaja dari yang tidak.
 *
 * Halaman statis merender sebagian besar section tanpa satu pun props
 * (`<Faq />`, `<Team />`), yang berarti section memakai teks bawaannya sendiri.
 * Baris block di sini DIISI dengan teks bawaan itu, diambil dari komponennya
 * lewat `blockDefaults` — bukan dibiarkan kosong. Tampilannya sama saja, tapi
 * editor yang membuka halaman bisa melihat dan menyunting teks yang sedang
 * tayang alih-alih menghadapi field kosong.
 */

type Row = { blockType: string } & Record<string, unknown>

/** Payload tidak punya array string; barisnya selalu objek `{ value }`. */
const rows = (values: readonly string[]) => values.map((value) => ({ value }))

const teks = (text: string) => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1,
})

const node = (type: string, text: string, extra: Record<string, unknown> = {}) => ({
  children: [teks(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  type,
  version: 1,
  ...extra,
})

const lexicalRoot = (children: unknown[]) => ({
  root: { children, direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 },
})

/** Banner halaman dalam; satu-satunya blok yang isinya berbeda di tiap halaman. */
const pageHero = (
  label: string,
  title: string,
  description: string,
  crumb: string,
): Row => ({
  blockType: 'pageHero',
  breadcrumbs: [{ label: crumb }],
  description,
  label,
  title,
})

/**
 * Field yang di Payload berbentuk baris `{ value }`, sementara data frontend
 * menyimpannya sebagai array string biasa.
 *
 * Tanpa konversi, nilainya tersimpan sebagai array kosong: Payload membuang
 * baris yang tidak punya field `value`, dan hasilnya blok yang terlihat terisi
 * di seed tapi kosong di basis data.
 */
const TEXT_LISTS: Record<string, string[]> = {
  caseStudies: ['items.tags'],
  documents: ['groups.items'],
  heroLight: ['marqueeItems'],
  integrations: ['items'],
  pricingPlans: ['items.features'],
}

const toRows = (values: unknown): unknown =>
  Array.isArray(values) ? values.map((value) => (typeof value === 'string' ? { value } : value)) : values

/** Terapkan konversi pada satu jalur field, mis. `items.tags`. */
const applyPath = (props: Record<string, unknown>, path: string): void => {
  const [head, nested] = path.split('.')
  if (!nested) {
    props[head] = toRows(props[head])
    return
  }
  const list = props[head]
  if (!Array.isArray(list)) {
    return
  }
  props[head] = list.map((row) =>
    row && typeof row === 'object'
      ? { ...(row as object), [nested]: toRows((row as Record<string, unknown>)[nested]) }
      : row,
  )
}

export type PageSeed = { layout: Row[]; slug: string; title: string }

/**
 * Susunan halaman dibangun dari data yang DIBERIKAN, bukan yang di-import.
 *
 * Sebelumnya berkas ini meng-import langsung dari folder frontend. Sekarang
 * pemanggil yang mengambilnya lewat HTTP dan menyerahkannya ke sini — satu-
 * satunya perubahan yang membuat CMS bisa berdiri sendiri.
 */
export const buildPageSeeds = (source: SeedSource): PageSeed[] => {
  const { blockDefaults, pages } = source
  const {
    aboutTimeline,
    aboutValues,
    applySteps,
    calculatorNotes,
    disclaimerClauses,
    partnerTracks,
    platformCapabilities,
    platformSnippet,
    securityCertifications,
    securityControls,
    servicePlans,
  } = pages

  const filled = (blockType: string, extra: Record<string, unknown> = {}): Row => {
    const props: Record<string, unknown> = { ...(blockDefaults[blockType] ?? {}) }
    for (const path of TEXT_LISTS[blockType] ?? []) {
      applyPath(props, path)
    }
    return { ...props, ...extra, blockType }
  }

  return [
  {
    layout: [
      filled('hero'),
      filled('about'),
      filled('servicesGrid'),
      filled('benefits'),
      filled('trustIndicators'),
      filled('loanCalculator'),
      filled('testimonials'),
      filled('integrations'),
      filled('blogPreview'),
    ],
    slug: 'beranda-utama',
    title: 'Beranda',
  },
  {
    layout: [
      pageHero(
        'Tentang kami',
        'Bank digital yang dibangun oleh praktisi, bukan pemasar',
        'Kami memulai ReactBank karena layanan keuangan yang kami butuhkan sebagai pelaku usaha belum ada. Hari ini 4,2 juta orang memakainya.',
        'Tentang Kami',
      ),
      {
        blockType: 'featureGrid',
        columns: '3',
        description:
          'Produk keuangan sering rumit bukan karena harus, tapi karena kerumitan itu menguntungkan penerbitnya. Kami mengambil posisi sebaliknya.',
        items: aboutValues,
        label: 'Misi',
        title: 'Membuat keputusan finansial jadi lebih mudah dipahami',
      },
      {
        blockType: 'cardGrid',
        columns: '4',
        items: aboutTimeline.map((item) => ({
          detail: item.detail,
          eyebrow: item.year,
          title: item.title,
        })),
        label: 'Perjalanan',
        title: 'Tujuh tahun, satu arah',
      },
      filled('trustIndicators'),
      filled('awards'),
      filled('team'),
      filled('testimonials'),
      filled('faq'),
    ],
    slug: 'about-us',
    title: 'Tentang Kami',
  },
  {
    layout: [
      pageHero(
        'Produk & layanan',
        'Satu platform, seluruh kebutuhan keuangan Anda',
        'Pilih paket yang sesuai tahap pertumbuhan Anda. Semua paket memakai infrastruktur dan standar keamanan yang sama.',
        'Produk & Layanan',
      ),
      filled('servicesGrid', { spacing: 'lg-md' }),
      {
        blockType: 'pricingPlans',
        items: servicePlans.map((plan) => ({
          features: rows(plan.features),
          highlight: Boolean((plan as { highlight?: boolean }).highlight),
          name: plan.name,
          note: plan.note,
          price: plan.price,
          variant: plan.variant,
        })),
        label: 'Paket harga',
        title: 'Harga yang bisa Anda hitung sendiri',
      },
      filled('benefits'),
      filled('faq'),
      filled('clientReviews'),
    ],
    slug: 'services',
    title: 'Produk & Layanan',
  },
  {
    layout: [
      pageHero(
        'Platform',
        'Infrastruktur keuangan yang bisa Anda bangun di atasnya',
        'Yang dipakai produk kami sendiri adalah API yang sama yang Anda pakai. Tanpa jalur internal istimewa.',
        'Platform',
      ),
      {
        blockType: 'featureGrid',
        columns: '4',
        items: platformCapabilities,
        label: 'Kapabilitas',
        title: 'Empat hal yang menopang semuanya',
      },
      {
        blockType: 'codeSample',
        code: platformSnippet,
        description:
          'Semua endpoint memakai idempotency key, sehingga percobaan ulang tidak pernah menghasilkan transaksi ganda.',
        label: 'Contoh integrasi',
        title: 'Kirim dana pertama Anda dalam satu panggilan',
      },
      {
        blockType: 'videoFeature',
        caption: 'Demo platform — 4 menit',
        description:
          'Rekaman layar tanpa narasi pemasaran: pembuatan rekening, transfer, dan rekonsiliasi.',
        label: 'Sumber belajar',
        title: 'Tur singkat platform dalam 4 menit',
        videoTitle: 'Tur platform ReactBank',
      },
      filled('transactionHistory'),
      filled('securityProtocols'),
      filled('trustIndicators'),
      filled('integrations'),
    ],
    slug: 'platform',
    title: 'Platform',
  },
  {
    layout: [
      pageHero(
        'Keamanan',
        'Keamanan bukan fitur tambahan di sini',
        'Kontrol di bawah ini aktif untuk semua akun, di semua paket, tanpa perlu Anda nyalakan.',
        'Keamanan',
      ),
      {
        blockType: 'featureGrid',
        columns: '4',
        items: securityControls,
        label: 'Kontrol',
        title: 'Empat lapis pertahanan',
      },
      {
        blockType: 'cardGrid',
        columns: '4',
        items: securityCertifications,
        label: 'Kepatuhan',
        title: 'Sertifikasi dan pengawasan',
      },
      filled('securityProtocols'),
      filled('techStack'),
      filled('faq'),
      {
        blockType: 'callToAction',
        description:
          'Kirim laporan ke security@reactbank.id. Kami merespons dalam 24 jam kerja dan memberi imbalan sesuai tingkat keparahan.',
        label: 'Laporkan kerentanan',
        spacing: 'lg',
        title: 'Kami membayar temuan keamanan yang valid',
        tone: 'dark',
      },
    ],
    slug: 'security',
    title: 'Keamanan',
  },
  {
    layout: [
      pageHero(
        'Kemitraan',
        'Tumbuh bersama 128 mitra institusi',
        'Tiga jalur kemitraan dengan syarat komersial yang jelas sejak awal.',
        'Partner',
      ),
      { blockType: 'featureGrid', columns: '3', items: partnerTracks },
      {
        actions: [{ href: '/contact', label: 'Ajukan Kemitraan', variant: 'secondary' }],
        blockType: 'callToAction',
        description:
          'Ceritakan model bisnis Anda, kami balas dengan skema komisi dan kebutuhan teknisnya.',
        label: 'Mulai',
        title: 'Diskusi awal biasanya cukup 30 menit',
      },
      filled('stepFlow'),
      filled('creditTiers'),
      filled('integrations'),
      filled('clientReviews'),
    ],
    slug: 'partners',
    title: 'Partner',
  },
  {
    layout: [
      pageHero(
        'Kalkulator finansial',
        'Hitung dulu, ajukan kemudian',
        'Dua alat yang paling sering dipakai nasabah kami: simulasi angsuran dan proyeksi tabungan.',
        'Kalkulator Finansial',
      ),
      filled('calculatorTabs'),
      filled('savingsCalculator'),
      {
        blockType: 'cardGrid',
        columns: '3',
        items: calculatorNotes,
        label: 'Catatan',
        title: 'Cara membaca hasilnya',
      },
      filled('faq'),
    ],
    slug: 'financial-tools',
    title: 'Kalkulator Finansial',
  },
  {
    layout: [
      pageHero(
        'Pembiayaan fleksibel',
        'Ajukan pinjaman tanpa datang ke cabang',
        'Semua verifikasi berjalan digital dengan tanda tangan elektronik tersertifikasi.',
        'Ajukan Pinjaman',
      ),
      filled('loanCategories'),
      filled('advantages'),
      {
        blockType: 'stepFlow',
        items: applySteps.map((step) => ({ detail: step.detail, title: step.title })),
        label: 'Alur pengajuan',
        title: 'Empat langkah sampai dana cair',
      },
      filled('trustIndicators'),
      filled('loanForm'),
    ],
    slug: 'apply-loan',
    title: 'Ajukan Pinjaman',
  },
  {
    layout: [
      pageHero(
        'Simulasi kelayakan',
        'Cek plafon Anda tanpa memengaruhi skor kredit',
        'Simulasi ini berjalan di peramban Anda dan tidak dikirim ke mana pun. Hasilnya indikatif, bukan persetujuan kredit.',
        'Simulasi Kelayakan',
      ),
      filled('eligibilityForm'),
      filled('documents'),
      filled('creditTiers'),
      filled('faq'),
    ],
    slug: 'loan-eligibility',
    title: 'Simulasi Kelayakan',
  },
  {
    layout: [
      filled('heroLight'),
      filled('clientReviews'),
      filled('servicesGrid', { spacing: 'lg-md' }),
      filled('benefits'),
      filled('stepFlow'),
      filled('trustIndicators'),
      filled('advantages'),
      filled('faq'),
      filled('blogPreview'),
    ],
    slug: 'home-v2',
    title: 'Beranda V2',
  },
  {
    layout: [
      filled('heroLight'),
      filled('trustIndicators'),
      filled('calculatorTabs'),
      filled('caseStudies', { spacing: 'lg-md' }),
      filled('transactionHistory'),
      filled('awards'),
      filled('securityProtocols'),
      filled('globalInfrastructure', { tone: 'light' }),
      filled('faq'),
    ],
    slug: 'home-v3',
    title: 'Beranda V3',
  },
  {
    layout: [
      pageHero(
        'Kontak',
        'Bicara dengan orang, bukan bot',
        'Rata-rata waktu respons chat kami di bawah dua menit pada jam kerja.',
        'Kontak',
      ),
      {
        blockType: 'contactPanel',
        channelsLabel: 'Kanal',
        channelsTitle: 'Cara tercepat menghubungi kami',
        formTitle: 'Kirim pesan',
        submitLabel: 'Kirim Pesan',
        topics: [
          { label: 'Pertanyaan produk', value: 'produk' },
          { label: 'Kemitraan', value: 'kemitraan' },
          { label: 'Dukungan teknis / API', value: 'teknis' },
          { label: 'Media & pers', value: 'media' },
        ],
      },
      filled('globalInfrastructure'),
      filled('faq'),
    ],
    slug: 'contact',
    title: 'Kontak',
  },
  {
    layout: [
      pageHero('Legal', 'Disclaimer', 'Terakhir diperbarui 1 Agustus 2026.', 'Disclaimer'),
      {
        blockType: 'prose',
        // Klausul hukum dirender sebagai judul + paragraf, bukan kartu: yang
        // dibaca orang di halaman seperti ini adalah dokumen, bukan daftar.
        content: lexicalRoot(
          disclaimerClauses.flatMap((clause) => [
            node('heading', clause.title, { tag: 'h3' }),
            node('paragraph', clause.body),
          ]),
        ),
      },
    ],
    slug: 'disclaimer',
    title: 'Disclaimer',
  },
  ]
}
