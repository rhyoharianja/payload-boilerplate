import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /*
     * Pakai binary Chromium yang sudah ada di mesin ini bila `CHROMIUM_PATH`
     * di-set. Playwright menuntut revisi persis untuk versinya, dan mengunduh
     * ulang ratusan megabyte hanya karena selisih revisi tidak sepadan saat
     * build yang setara sudah tersedia. Di CI variabelnya dibiarkan kosong
     * sehingga Playwright memakai unduhannya sendiri.
     */
    launchOptions: process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {},
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  /*
   * CMS berjalan di :3001 (lihat PORT di .env), bukan :3000. Dengan URL yang
   * salah, Playwright mengira server belum hidup lalu menjalankan `pnpm dev`
   * kedua kalinya — yang langsung mati karena port sudah dipakai.
   */
  webServer: {
    command: 'pnpm dev',
    reuseExistingServer: true,
    url: process.env.CMS_URL ?? 'http://localhost:3001',
  },
})
