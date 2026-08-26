import type { CollectionConfig } from 'payload'

import { publishedOrAuthenticated, slugField } from './shared'

/**
 * Artikel blog.
 *
 * Kategori dan penulis berupa RELASI, bukan teks. Data statis frontend menyimpan
 * `categorySlug` dan `authorSlug` sebagai string — itu wajar untuk berkas TypeScript
 * yang diperiksa compiler, tapi di CMS string seperti itu tidak punya yang
 * menjaganya: mengganti slug kategori membuat setiap artikel yang menyebutnya
 * menunjuk ke halaman yang tidak ada, tanpa satu pun peringatan.
 */
export const Posts: CollectionConfig = {
  slug: 'posts',
  access: { read: publishedOrAuthenticated },
  admin: {
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    group: 'Konten',
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', label: 'Judul', required: true },
    slugField('Dipakai di /blog/<slug>.'),
    { name: 'excerpt', type: 'textarea', label: 'Ringkasan' },
    {
      name: 'category',
      type: 'relationship',
      label: 'Kategori',
      relationTo: 'categories',
    },
    {
      name: 'author',
      type: 'relationship',
      label: 'Penulis',
      relationTo: 'authors',
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { description: 'Tanggal yang ditampilkan di kartu artikel.' },
      label: 'Tanggal terbit',
    },
    {
      name: 'readingTime',
      type: 'text',
      admin: { description: 'Mis. "6 menit". Kata "baca" ditambahkan frontend.' },
      label: 'Lama baca',
    },
    { name: 'cover', type: 'upload', label: 'Gambar sampul', relationTo: 'media' },
    { name: 'body', type: 'richText', label: 'Isi artikel' },
  ],
  labels: { plural: 'Artikel', singular: 'Artikel' },
  versions: { drafts: true, maxPerDoc: 20 },
}
