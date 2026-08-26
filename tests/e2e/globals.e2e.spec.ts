import { expect, test } from '@playwright/test'
import { adminEmail, adminPassword } from '../helpers/adminCredentials'

/**
 * Header dan Footer frontend digerakkan oleh global Payload.
 *
 * Yang diuji bukan "navigasinya muncul" — itu tetap muncul walau global-nya
 * diabaikan sepenuhnya, karena komponennya membawa data statis sebagai
 * cadangan. Justru itu bahayanya: sambungan ke CMS bisa putus total tanpa satu
 * pun gejala di halaman.
 *
 * Jadi yang diuji adalah PERUBAHANNYA: nilai global diubah lewat API, halaman
 * dimuat ulang, dan nilai baru itu harus muncul. Hanya itu yang membedakan
 * "membaca dari CMS" dari "kebetulan datanya sama".
 */

const CMS = process.env.CMS_URL ?? 'http://localhost:3001'
const FRONTEND = process.env.FRONTEND_URL ?? 'http://localhost:3030'
const EMAIL = adminEmail()
const PASSWORD = adminPassword()

/** Penanda yang tidak mungkin ada di data statis. */
const MARKER = 'Nama Situs Uji E2E'

let token: string
let originalName: string

test.beforeAll(async ({ request }) => {
  const login = await request.post(`${CMS}/api/users/login`, {
    data: { email: EMAIL, password: PASSWORD },
  })
  expect(login.ok(), 'login admin harus berhasil').toBeTruthy()
  token = ((await login.json()) as { token: string }).token

  const current = await request.get(`${CMS}/api/globals/site-settings`, {
    headers: { Authorization: `JWT ${token}` },
  })
  originalName = ((await current.json()) as { name?: string }).name ?? 'ReactBank'
})

test.afterAll(async ({ request }) => {
  // Nilai semula dikembalikan APA PUN hasil test-nya: suite lain membaca
  // halaman yang sama, dan nama situs yang tertinggal berubah akan membuat
  // mereka gagal di tempat yang tidak ada hubungannya.
  await request.post(`${CMS}/api/globals/site-settings`, {
    data: { name: originalName },
    headers: { Authorization: `JWT ${token}` },
  })
})

test('nama situs di footer frontend berasal dari global, bukan data statis', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000)

  const updated = await request.post(`${CMS}/api/globals/site-settings`, {
    data: { name: MARKER },
    headers: { Authorization: `JWT ${token}` },
  })
  expect(updated.ok(), 'pembaruan global harus berhasil').toBeTruthy()

  await expect
    .poll(
      async () => {
        await page.goto(FRONTEND, { waitUntil: 'domcontentloaded' })
        return page.locator('footer').innerText()
      },
      {
        message: 'nama dari global tidak pernah muncul di footer frontend',
        timeout: 60_000,
      },
    )
    .toContain(MARKER)
})

test('menu utama frontend memuat butir dari global header', async ({ page, request }) => {
  const res = await request.get(`${CMS}/api/globals/header`)
  expect(res.ok(), 'global header harus bisa dibaca publik').toBeTruthy()

  const { mainNav } = (await res.json()) as { mainNav?: { label?: string }[] }
  const labels = (mainNav ?? []).map((item) => item.label).filter(Boolean)
  expect(labels.length, 'global header belum berisi menu — jalankan `pnpm seed:content`').toBeGreaterThan(0)

  await page.goto(FRONTEND)
  const header = page.locator('header').first()
  for (const label of labels) {
    await expect(
      header.getByText(label!, { exact: true }).first(),
      `butir menu "${label}" dari global tidak muncul di header`,
    ).toBeVisible({ timeout: 30_000 })
  }
})
