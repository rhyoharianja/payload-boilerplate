/**
 * Tailwind dipakai oleh berkas gaya milik plugin dan komponen admin kustom,
 * BUKAN oleh panel Payload itu sendiri.
 *
 * Base style Tailwind sengaja tidak pernah dimuat di `(payload)`: reset-nya
 * menabrak SCSS panel admin dan merusak tata letaknya. Lihat catatan di
 * `src/app/(payload)/custom.scss`.
 */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
