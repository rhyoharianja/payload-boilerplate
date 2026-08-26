import { expect, test } from '@playwright/test'
import { adminEmail, adminPassword } from '../helpers/adminCredentials'

/**
 * Route blog dan studi kasus frontend dilayani collection Payload.
 *
 * Yang diuji BUKAN "halamannya terbuka dan ada artikel". Data seed sengaja
 * disalin dari data statis yang dulu tertanam di frontend, jadi halaman akan
 * terlihat benar walaupun sambungan ke CMS putus sama sekali — dan itu justru
 * kegagalan yang paling mudah lolos.
 *
 * Jadi yang diuji perubahannya: satu dokumen diubah lewat API, halaman dimuat
 * ulang, dan perubahan itu harus muncul. Hanya itu yang membedakan "membaca
 * dari CMS" dari "kebetulan isinya sama".
 */

const CMS = process.env.CMS_URL ?? 'http://localhost:3001'
const FRONTEND = process.env.FRONTEND_URL ?? 'http://localhost:3030'
const EMAIL = adminEmail()
const PASSWORD = adminPassword()

/** Penanda yang tidak mungkin ada di data statis frontend. */
const MARKER = 'Judul Artikel Uji E2E'

let token: string
let postId: number | string
let postSlug: string
let originalTitle: string

test.beforeAll(async ({ request }) => {
  const login = await request.post(`${CMS}/api/users/login`, {
    data: { email: EMAIL, password: PASSWORD },
  })
  expect(login.ok(), 'login admin harus berhasil').toBeTruthy()
  token = ((await login.json()) as { token: string }).token

  const list = await request.get(`${CMS}/api/posts?limit=1&depth=0`)
  const { docs } = (await list.json()) as { docs: { id: number | string; slug: string; title: string }[] }
  expect(docs?.length, 'tidak ada artikel — jalankan `pnpm seed:content`').toBeGreaterThan(0)

  postId = docs[0].id
  postSlug = docs[0].slug
  originalTitle = docs[0].title
})

test.afterAll(async ({ request }) => {
  // Judul semula dikembalikan APA PUN hasil test-nya: suite lain membaca
  // halaman yang sama, dan judul yang tertinggal berubah akan membuat mereka
  // gagal di tempat yang tidak ada hubungannya.
  if (postId) {
    await request.patch(`${CMS}/api/posts/${postId}`, {
      data: { title: originalTitle },
      headers: { Authorization: `JWT ${token}` },
    })
  }
})

test('judul artikel di frontend berasal dari CMS, bukan data statis', async ({ page, request }) => {
  test.setTimeout(120_000)

  const updated = await request.patch(`${CMS}/api/posts/${postId}`, {
    data: { title: MARKER },
    headers: { Authorization: `JWT ${token}` },
  })
  expect(updated.ok(), 'pembaruan artikel harus berhasil').toBeTruthy()

  await expect
    .poll(
      async () => {
        await page.goto(`${FRONTEND}/blog/${postSlug}`, { waitUntil: 'domcontentloaded' })
        return page.locator('h1').first().innerText()
      },
      {
        message: 'judul dari CMS tidak pernah muncul di halaman artikel',
        timeout: 60_000,
      },
    )
    .toContain(MARKER)
})

test('isi artikel dirender dari field rich text', async ({ page, request }) => {
  const res = await request.get(`${CMS}/api/posts?limit=1&depth=0&where[slug][equals]=${postSlug}`)
  const { docs } = (await res.json()) as {
    docs: { body?: { root?: { children?: { children?: { text?: string }[]; type?: string }[] } } }[]
  }

  // Teks pembanding diambil dari DOKUMEN, bukan ditulis tetap di test: isi
  // artikel adalah data yang boleh disunting siapa pun.
  const heading = docs[0]?.body?.root?.children?.find((node) => node.type === 'heading')
  const headingText = heading?.children?.[0]?.text
  expect(headingText, 'artikel belum punya isi rich text — jalankan `pnpm seed:content`').toBeTruthy()

  await page.goto(`${FRONTEND}/blog/${postSlug}`)
  await expect(
    page.getByRole('heading', { name: headingText! }).first(),
    'judul bagian dari rich text tidak dirender',
  ).toBeVisible({ timeout: 30_000 })
})

test('daftar kategori dan penulis dihitung dari artikel di CMS', async ({ page, request }) => {
  const res = await request.get(`${CMS}/api/categories?limit=100&depth=0`)
  const { docs } = (await res.json()) as { docs: { name: string; slug: string }[] }
  expect(docs.length, 'belum ada kategori').toBeGreaterThan(0)

  await page.goto(`${FRONTEND}/blog-genre`)

  /*
   * Pencarian dibatasi ke `<main>`.
   *
   * Nama kategori seperti "Keamanan" juga ada di menu navigasi, termasuk salinan
   * menu mobile yang selalu tersembunyi. `.first()` pada seluruh halaman
   * mengenai salinan itu, lalu gagal dengan "unexpected value: hidden" — terbaca
   * seolah kategorinya tidak dirender.
   */
  const main = page.locator('main')
  for (const category of docs) {
    await expect(
      main.getByText(category.name, { exact: true }).first(),
      `kategori "${category.name}" dari CMS tidak muncul`,
    ).toBeVisible({ timeout: 30_000 })
  }
})

test('studi kasus dilayani collection, termasuk halaman detailnya', async ({ page, request }) => {
  const res = await request.get(`${CMS}/api/case-studies?limit=1&depth=0`)
  const { docs } = (await res.json()) as { docs: { slug: string; title: string }[] }
  expect(docs?.length, 'belum ada studi kasus').toBeGreaterThan(0)

  await page.goto(`${FRONTEND}/case-study/${docs[0].slug}`)
  await expect(page.locator('h1').first()).toHaveText(docs[0].title, { timeout: 30_000 })
})
