// Tailwind hanya untuk route group (frontend). Base styles-nya SENGAJA tidak
// pernah dimuat di (payload): reset Tailwind menabrak SCSS panel admin dan
// merusak tata letaknya. Lihat catatan di src/app/(payload)/custom.scss.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
