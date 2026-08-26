import type { CollectionConfig } from 'payload'

import { layoutBlocks } from '../blocks'

/**
 * Collection halaman — MILIK APLIKASI, bukan dibuat plugin.
 *
 * Plugin Puck menempel pada collection ini; ia tidak mendefinisikan blok apa pun.
 * Yang menentukan blok apa yang tersedia adalah `layoutBlocks` di bawah.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    // Draft hanya boleh dibaca yang terautentikasi. Jaring pengaman: kalau route
    // publik frontend salah mengirim `draft=true`, permintaannya ditolak di sini
    // alih-alih membocorkan konten belum terbit.
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Konten',
    // URL Live Preview didefinisikan sekali di root config. Menyalinnya ke sini
    // hanya membuat definisi root diam-diam tidak terpakai — yang di koleksi
    // selalu menang saat digabung.
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', label: 'Judul', required: true },
    {
      name: 'slug',
      type: 'text',
      admin: { description: 'Tanpa garis miring di depan. Gunakan `home` untuk halaman utama.' },
      index: true,
      label: 'Slug',
      required: true,
      unique: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      admin: { description: 'Tambah dan urutkan bagian halaman di sini.' },
      blocks: layoutBlocks,
      // `labels.singular` menentukan bunyi tombolnya: Payload merender
      // "Add <singular>". Tanpa ini tombolnya berbunyi "Add Layout" versi field.
      labels: { plural: 'Layout', singular: 'Layout' },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', label: 'Judul SEO' },
        { name: 'description', type: 'textarea', label: 'Deskripsi' },
      ],
      label: 'SEO',
    },
  ],
  labels: { plural: 'Halaman', singular: 'Halaman' },
  versions: { drafts: true, maxPerDoc: 20 },
}
