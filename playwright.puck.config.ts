import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

/**
 * Config terpisah untuk uji canvas Puck.
 *
 * `playwright.config.ts` bawaan menunjuk `http://localhost:3000`, padahal script
 * `dev` menjalankan aplikasi di port 3001 — jadi `reuseExistingServer` tidak
 * pernah menemukan server yang sudah jalan dan mencoba menyalakan yang baru,
 * yang langsung gagal EADDRINUSE. Config ini tidak menyentuh yang lama.
 */
export default defineConfig({
  /*
   * Tanpa retry, dan itu disengaja.
   *
   * Retry pernah dipasang saat suite ini masih flaky. Penyebabnya ternyata bukan
   * ketidakpastian yang wajar, melainkan tiga bug di test-nya sendiri: dua spec
   * berbagi preferensi admin yang tersimpan di SERVER, login berulang membuat
   * sesi Payload saling menimpa, dan beberapa assertion bergantung pada state
   * yang tidak diuji. Setelah ketiganya diperbaiki, suite lolos 13/13 tiga run
   * berturut-turut dalam ~4,5 detik.
   *
   * Retry di sini hanya akan menyembunyikan kegagalan berikutnya.
   */
  retries: 0,
  reporter: 'list',
  testDir: './tests/e2e',
  timeout: 120_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:3001',
    /*
     * Menunjuk executable secara eksplisit.
     *
     * Playwright 1.58 mencari build 1208, tapi yang lengkap di mesin ini build
     * 1234 (dipasang oleh Playwright versi lain). Menunggu unduhan 1208 hanya
     * menambah ~150MB untuk browser yang fungsinya sama, jadi dipakai yang sudah
     * ada. Ini khusus mesin dev — di CI, `npx playwright install` yang berlaku.
     */
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM ??
        'C:/Users/haria/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe',
    },
  },
  webServer: {
    command: 'pnpm dev',
    reuseExistingServer: true,
    timeout: 180_000,
    // Health-check menunjuk halaman login admin, bukan endpoint milik plugin:
    // endpoint plugin bisa hilang seiring arsitekturnya berubah (dan memang
    // pernah), lalu Playwright menyimpulkan server mati dan gagal EADDRINUSE.
    url: 'http://localhost:3001/admin/login',
  },
})
