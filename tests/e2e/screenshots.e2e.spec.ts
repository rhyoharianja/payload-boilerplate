import { expect, test } from '@playwright/test'
import { adminEmail, adminPassword } from '../helpers/adminCredentials'

/**
 * Menangkap tangkapan layar untuk README.
 *
 * Bukan uji perilaku — ia hanya merekam. Dijalankan sendiri lewat
 * `--grep @screenshot`, dan dilewati pada run biasa: tangkapan layar tidak punya
 * assertion yang berarti, dan menjadikannya bagian suite berarti setiap kali CI
 * berjalan ada berkas gambar yang berubah tanpa alasan.
 */

const CMS = process.env.CMS_URL ?? 'http://localhost:3001'
const FRONTEND = process.env.FRONTEND_URL ?? 'http://localhost:3030'
const EMAIL = adminEmail()
const PASSWORD = adminPassword()

const OUT = 'docs/screenshots'

test.describe('@screenshot', () => {
  test.skip(!process.env.CAPTURE_SCREENSHOTS, 'Setel CAPTURE_SCREENSHOTS=1 untuk merekam.')
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1440 })
  })

  test('halaman login admin', async ({ page }) => {
    await page.goto(`${CMS}/admin/login`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: `${OUT}/admin-login.png` })
  })

  test('dashboard, penyunting Puck, dan form block', async ({ page }) => {
    test.setTimeout(240_000)

    await page.goto(`${CMS}/admin/login`)
    await page.fill('#field-email', EMAIL)
    await page.fill('#field-password', PASSWORD)
    await page.click('form button[type="submit"]')
    await page.waitForURL(/\/admin(?!\/login)/, { timeout: 60_000 })
    await page.waitForTimeout(3000)
    await page.screenshot({ path: `${OUT}/admin-dashboard.png` })

    const list = await page.request.get(`${CMS}/api/pages?limit=1&where[slug][equals]=about-us`)
    const { docs } = (await list.json()) as { docs: { id: number | string }[] }
    expect(docs?.length, 'halaman about-us belum ada — jalankan `pnpm seed:content`').toBeTruthy()
    const id = docs[0].id

    await page.goto(`${CMS}/admin/collections/pages/${id}`)
    await expect(page.locator('#field-title')).toBeVisible({ timeout: 120_000 })
    await page.waitForTimeout(2500)
    await page.screenshot({ path: `${OUT}/admin-page-form.png` })

    await page.goto(`${CMS}/admin/collections/pages/${id}/puck`)
    await expect(page.locator('#puck-advance-save')).toBeVisible({ timeout: 120_000 })
    await page.waitForTimeout(6000)
    await page.screenshot({ path: `${OUT}/puck-editor.png` })
  })

  test('frontend lintas domain', async ({ page }) => {
    test.setTimeout(180_000)

    await page.goto(FRONTEND, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: `${OUT}/frontend-home.png` })

    await page.goto(`${FRONTEND}/about-us`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `${OUT}/frontend-about.png` })
  })
})
