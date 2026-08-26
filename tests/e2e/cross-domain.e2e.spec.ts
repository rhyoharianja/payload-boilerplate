import { expect, test } from '@playwright/test'
import { adminEmail, adminPassword } from '../helpers/adminCredentials'

/**
 * Uji lintas domain: frontend dan CMS berada di origin berbeda.
 *
 * Yang diuji bukan "halaman terbuka", melainkan hal-hal yang HANYA rusak saat
 * origin dipisah — dan diam-diam lolos kalau keduanya satu origin:
 *
 *   1. Frontend mengambil konten dari REST API CMS lewat CORS.
 *   2. Canvas Puck memuat stylesheet frontend dari origin FRONTEND, bukan CMS.
 *   3. Live Preview bisa menampilkan frontend di dalam iframe milik admin.
 *
 * Poin kedua pernah gagal sungguhan: href stylesheet Next bersifat relatif, dan
 * saat dipasang di iframe canvas ia di-resolve ke origin CMS lalu 404. Test ini
 * menangkapnya dengan memeriksa ORIGIN dari setiap permintaan CSS.
 */

const CMS = process.env.CMS_URL ?? 'http://localhost:3001'
const FRONTEND = process.env.FRONTEND_URL ?? 'http://localhost:3030'
const EMAIL = adminEmail()
const PASSWORD = adminPassword()

/** Slug halaman uji yang dibuat di `beforeAll`. */
const SLUG = 'e2e-lintas-domain'

let pageId: number | string

test.beforeAll(async ({ request }) => {
  const login = await request.post(`${CMS}/api/users/login`, {
    data: { email: EMAIL, password: PASSWORD },
  })
  expect(login.ok(), 'login admin harus berhasil').toBeTruthy()
  const { token } = (await login.json()) as { token: string }

  // Bersihkan sisa jalannya test sebelumnya supaya slug tetap unik.
  const existing = await request.get(`${CMS}/api/pages?where[slug][equals]=${SLUG}&limit=1`, {
    headers: { Authorization: `JWT ${token}` },
  })
  const found = (await existing.json()) as { docs: { id: number | string }[] }
  for (const doc of found.docs ?? []) {
    await request.delete(`${CMS}/api/pages/${doc.id}`, {
      headers: { Authorization: `JWT ${token}` },
    })
  }

  const created = await request.post(`${CMS}/api/pages`, {
    data: {
      _status: 'published',
      layout: [
        {
          blockType: 'benefits',
          description: 'Ditulis oleh uji E2E.',
          items: [{ description: 'Baris dari Payload.', title: 'Item E2E' }],
          title: 'Judul E2E dari CMS',
          tone: 'dark',
        },
      ],
      slug: SLUG,
      title: 'Halaman uji lintas domain',
    },
    headers: { Authorization: `JWT ${token}` },
  })
  expect(created.ok(), 'pembuatan halaman uji harus berhasil').toBeTruthy()
  pageId = ((await created.json()) as { doc: { id: number | string } }).doc.id
})

test('frontend merender konten CMS lewat REST API lintas origin', async ({ page }) => {
  // Halaman CMS kini dilayani dari ROOT, bukan dari `/cms/...`. Prefiks itu ada
  // selama halaman statis masih hidup berdampingan; sejak semuanya pindah ke
  // CMS, prefiksnya tidak punya alasan untuk ada lagi.
  await page.goto(`${FRONTEND}/${SLUG}`)

  await expect(page.getByText('Judul E2E dari CMS')).toBeVisible()
  await expect(page.getByText('Baris dari Payload.')).toBeVisible()
})

test('canvas Puck memuat CSS dari origin FRONTEND, bukan dari CMS', async ({ page }) => {
  // Setiap permintaan stylesheet dicatat beserta origin-nya. Inilah inti test:
  // href relatif akan muncul sebagai permintaan ke origin CMS dan gagal.
  const cssRequests: string[] = []
  page.on('request', (req) => {
    if (req.resourceType() === 'stylesheet') {
      cssRequests.push(req.url())
    }
  })
  const failedCss: string[] = []
  page.on('response', (res) => {
    if (res.request().resourceType() === 'stylesheet' && res.status() >= 400) {
      failedCss.push(`${res.status()} ${res.url()}`)
    }
  })

  await page.goto(`${CMS}/admin/login`)
  await page.fill('#field-email', EMAIL)
  await page.fill('#field-password', PASSWORD)
  await page.click('form button[type="submit"]')
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 60_000 })

  await page.goto(`${CMS}/admin/collections/pages/${pageId}/puck`)

  // Penyuntikan stylesheet berjalan setelah fetch lintas origin selesai.
  await expect
    .poll(() => cssRequests.filter((u) => u.startsWith(FRONTEND)).length, { timeout: 60_000 })
    .toBeGreaterThan(0)

  // Tidak boleh ada CSS frontend yang diminta ke origin CMS. `/_next/static/css`
  // di origin CMS adalah tanda href relatif yang lolos tanpa di-absolutkan.
  const wrongOrigin = cssRequests.filter(
    (url) => url.startsWith(CMS) && url.includes('/_next/static/css'),
  )
  expect(wrongOrigin, 'CSS frontend tidak boleh diminta ke origin CMS').toEqual([])
  expect(failedCss, 'tidak boleh ada stylesheet yang gagal dimuat').toEqual([])
})

test('Live Preview menampilkan frontend di dalam iframe admin', async ({ page }) => {
  // Memuat iframe lintas origin lalu menunggu React-nya hidrasi jauh lebih
  // lambat daripada batas 30 detik bawaan Playwright.
  test.setTimeout(120_000)

  await page.goto(`${CMS}/admin/login`)
  await page.fill('#field-email', EMAIL)
  await page.fill('#field-password', PASSWORD)
  await page.click('form button[type="submit"]')
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 60_000 })

  await page.goto(`${CMS}/admin/collections/pages/${pageId}`)

  /*
   * Live Preview dinyalakan lewat STATE React, bukan query URL — plugin
   * mengganti tombol mata bawaan Payload dengan `<select>` tiga mode. Mencoba
   * `?payload-livepreview=true` tidak melakukan apa pun, dan test yang memakai
   * cara itu gagal seolah iframe-nya yang bermasalah.
   */
  const modeSelect = page.locator('#puck-advance-edit-mode')
  await expect(modeSelect).toBeVisible({ timeout: 60_000 })

  /*
   * Isi iframe dicari ulang di SELURUH frame setiap kali, bukan lewat satu
   * `FrameLocator` yang dipatok ke `src`.
   *
   * Live Preview me-mount ulang iframe-nya setiap kali menerima pembaruan, dan
   * locator yang menunjuk frame lama tidak error — ia hanya tidak pernah
   * menemukan apa pun. Gejalanya terbaca seolah `frame-ancestors` menolak
   * iframe-nya, padahal frame-nya sekadar sudah diganti.
   */
  const contentVisible = async () => {
    for (const frame of page.frames()) {
      if (!frame.url().includes('3030')) {
        continue
      }
      try {
        if (await frame.getByText('Judul E2E dari CMS').first().isVisible({ timeout: 500 })) {
          return true
        }
      } catch {
        // Frame lepas saat Live Preview me-mount ulang; dicoba lagi.
      }
    }
    return false
  }

  /*
   * Pemilihan mode DIULANG sampai menempel, bukan dilakukan sekali.
   *
   * `selectOption` mengubah nilai DOM dan mengirim event, tapi kalau React belum
   * hidrasi, tidak ada handler yang mendengarnya — dan begitu hidrasi selesai
   * React mengembalikan nilainya ke state-nya sendiri, yaitu "form". Panel
   * preview tidak pernah muncul, dan gagalnya terbaca seolah iframe lintas
   * origin yang ditolak. Terlihat hanya saat mesin sedang sibuk, jadi ia lolos
   * di run tunggal dan gagal di run penuh.
   */
  await expect
    .poll(
      async () => {
        if ((await modeSelect.inputValue()) !== 'live-preview') {
          await modeSelect.selectOption('live-preview')
        }
        return contentVisible()
      },
      {
        message: 'konten CMS tidak pernah muncul di iframe frontend lintas origin',
        timeout: 120_000,
      },
    )
    .toBe(true)
})
