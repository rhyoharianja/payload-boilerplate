import type { Access, Field } from 'payload'

/**
 * Potongan yang dipakai berulang oleh collection konten.
 *
 * Dikumpulkan di sini bukan demi keringkasan, melainkan supaya aturan yang sama
 * benar-benar sama. Access control yang disalin per collection akan menyimpang
 * pada suatu titik, dan yang menyimpang diam-diam adalah yang paling mahal:
 * satu collection membocorkan draft sementara yang lain tidak.
 */

/**
 * Draft hanya untuk yang terautentikasi; publik hanya melihat yang terbit.
 *
 * Jaring pengaman berlapis: kalau route frontend salah mengirim `draft=true`,
 * permintaannya ditolak di sini alih-alih membocorkan konten belum terbit.
 */
export const publishedOrAuthenticated: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }

/**
 * Slug URL.
 *
 * `unique` DAN `index`: unique menjaga datanya, index menjaga kueri per-slug
 * tetap murah — frontend mengambil hampir semua dokumen lewat slug, bukan id.
 */
export const slugField = (description: string): Field => ({
  name: 'slug',
  type: 'text',
  admin: { description },
  index: true,
  label: 'Slug',
  required: true,
  unique: true,
})
