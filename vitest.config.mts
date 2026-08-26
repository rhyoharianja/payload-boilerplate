import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
    server: {
      deps: {
        /*
         * `payload-theme` mengirim import ESM TANPA ekstensi berkas
         * (`from './options'`). Itu sah bagi bundler, tapi tidak bagi Node,
         * sehingga paketnya gagal dimuat apa adanya di runtime uji.
         *
         * Di-inline supaya Vite yang me-resolve-nya, bukan Node. Ini bukan
         * pilihan gaya: tanpa ini seluruh suite yang menyentuh payload.config
         * gagal saat import, sebelum satu pun assertion berjalan.
         */
        /*
         * `payload-admin-theme` ikut di-inline karena DIA yang meng-import
         * `payload-theme`. Meng-inline yang di-import saja tidak cukup: selama
         * pengimpornya masih dieksternalkan, Node yang me-resolve dan gagal di
         * titik yang sama.
         */
        inline: ['payload-admin-theme', 'payload-theme'],
      },
    },
  },
})
