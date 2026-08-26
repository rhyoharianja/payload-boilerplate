import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface LoginOptions {
  page: Page
  serverURL?: string
  user: {
    email: string
    password: string
  }
}

/**
 * Logs the user into the admin panel via the login page.
 */
export async function login({
  page,
  // Porta CMS ikut konfigurasi. Angka 3000 bawaan template salah sejak
  // aplikasi ini pindah ke 3001, dan gagalnya muncul sebagai CONNECTION_REFUSED
  // di helper — jauh dari test yang sebenarnya bermasalah.
  serverURL = process.env.CMS_URL ?? 'http://localhost:3001',
  user,
}: LoginOptions): Promise<void> {
  await page.goto(`${serverURL}/admin/login`)

  await page.fill('#field-email', user.email)
  await page.fill('#field-password', user.password)
  await page.click('button[type="submit"]')

  await page.waitForURL(`${serverURL}/admin`)

  /*
   * Penanda berhasil login: URL sudah lepas dari /admin/login DAN tautan
   * Dashboard terlihat.
   *
   * Sebelumnya dipakai `span[title="Dashboard"]` — struktur nav BAWAAN Payload.
   * Nav itu diganti seluruhnya oleh `payload-admin-theme`, jadi selektornya tidak
   * pernah cocok lagi dan login yang sebenarnya berhasil dilaporkan gagal.
   */
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 60_000 })
  await expect(page.getByText('Dashboard').first()).toBeVisible({ timeout: 60_000 })
}
