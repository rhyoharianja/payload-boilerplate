import { expect, test } from '@playwright/test'
import { adminEmail, adminPassword } from '../helpers/adminCredentials'

/**
 * Halaman frontend disusun dari dokumen `pages`, bukan dari berkas route.
 *
 * Isi seed sengaja identik dengan halaman statis yang digantikannya, jadi
 * halaman akan terlihat benar walaupun sambungan ke CMS putus. Karena itu yang
 * diuji perubahannya — satu blok diubah lewat API, halaman dimuat ulang, dan
 * perubahan itu harus muncul.
 */

const CMS = process.env.CMS_URL ?? 'http://localhost:3001'
const FRONTEND = process.env.FRONTEND_URL ?? 'http://localhost:3030'
const EMAIL = adminEmail()
const PASSWORD = adminPassword()

/** Slug yang dulu punya berkas route sendiri di frontend. */
const MIGRATED = [
  'about-us',
  'services',
  'platform',
  'security',
  'partners',
  'financial-tools',
  'apply-loan',
  'loan-eligibility',
  'home-v2',
  'home-v3',
  'contact',
  'disclaimer',
]

const MARKER = 'Judul Blok Uji E2E'

let token: string

test.beforeAll(async ({ request }) => {
  const login = await request.post(`${CMS}/api/users/login`, {
    data: { email: EMAIL, password: PASSWORD },
  })
  expect(login.ok(), 'login admin harus berhasil').toBeTruthy()
  token = ((await login.json()) as { token: string }).token
})

test('setiap halaman yang dipindahkan punya dokumen di CMS', async ({ request }) => {
  for (const slug of MIGRATED) {
    const res = await request.get(`${CMS}/api/pages?depth=0&limit=1&where[slug][equals]=${slug}`)
    const { docs } = (await res.json()) as { docs: { layout?: unknown[] }[] }
    expect(
      docs?.[0]?.layout?.length,
      `halaman "${slug}" belum ada di CMS — jalankan \`pnpm seed:content\``,
    ).toBeGreaterThan(0)
  }
})

test('beranda dan seluruh halaman yang dipindahkan tayang tanpa error', async ({ page }) => {
  test.setTimeout(180_000)

  const failures: string[] = []
  for (const path of ['/', ...MIGRATED.map((slug) => `/${slug}`)]) {
    const res = await page.goto(`${FRONTEND}${path}`, { waitUntil: 'domcontentloaded' })
    if (res?.status() !== 200) {
      failures.push(`${path} → ${res?.status()}`)
    }
  }

  /*
   * Semua path dikunjungi dulu, baru dilaporkan sekaligus.
   *
   * Gagal pada path pertama menyembunyikan sisanya, dan yang ingin diketahui
   * saat migrasi bukan "ada yang rusak" melainkan "yang mana saja".
   */
  expect(failures, 'ada halaman yang tidak tayang').toEqual([])
})

test('URL tanpa dokumen tetap 404, bukan halaman kosong', async ({ page }) => {
  /*
   * Route dinamis di root menangkap setiap URL yang tidak punya berkas. Kalau ia
   * membalas 200 dengan badan kosong, salah ketik alamat menjadi halaman putih
   * yang terlihat seperti halaman rusak — bukan seperti alamat yang salah.
   */
  const res = await page.goto(`${FRONTEND}/slug-yang-pasti-tidak-ada-e2e`, {
    waitUntil: 'domcontentloaded',
  })
  expect(res?.status()).toBe(404)
})

test('mengubah blok di CMS mengubah halaman frontend', async ({ page, request }) => {
  test.setTimeout(180_000)

  const found = await request.get(`${CMS}/api/pages?depth=0&limit=1&where[slug][equals]=about-us`)
  const { docs } = (await found.json()) as {
    docs: { id: number | string; layout: { blockType: string; title?: string }[] }[]
  }
  const doc = docs[0]
  expect(doc, 'halaman about-us belum ada di CMS').toBeTruthy()

  const index = doc.layout.findIndex((block) => block.blockType === 'featureGrid')
  expect(index, 'about-us seharusnya memuat blok featureGrid').toBeGreaterThanOrEqual(0)

  const original = doc.layout[index].title
  const patched = doc.layout.map((block, i) =>
    i === index ? { ...block, title: MARKER } : block,
  )

  const update = await request.patch(`${CMS}/api/pages/${doc.id}`, {
    data: { layout: patched },
    headers: { Authorization: `JWT ${token}` },
  })
  expect(update.ok(), 'pembaruan halaman harus berhasil').toBeTruthy()

  try {
    await expect
      .poll(
        async () => {
          await page.goto(`${FRONTEND}/about-us`, { waitUntil: 'domcontentloaded' })
          return page.locator('main').innerText()
        },
        { message: 'perubahan blok tidak pernah muncul di frontend', timeout: 60_000 },
      )
      .toContain(MARKER)
  } finally {
    // Dikembalikan APA PUN hasilnya: uji lain membaca halaman yang sama, dan
    // judul yang tertinggal berubah membuat mereka gagal di tempat lain.
    await request.patch(`${CMS}/api/pages/${doc.id}`, {
      data: {
        layout: doc.layout.map((block, i) =>
          i === index ? { ...block, title: original } : block,
        ),
      },
      headers: { Authorization: `JWT ${token}` },
    })
  }
})
