import type { CollectionConfig } from 'payload'

import { publishedOrAuthenticated, slugField } from './shared'

/**
 * Studi kasus; punya halaman detail di `/case-study/<slug>`.
 *
 * Nama field `tags` dan `metrics` sengaja sama dengan yang dipakai block
 * `caseStudies`, termasuk bentuk barisnya (`{ value }` untuk tag). Itu yang
 * membuat satu komponen frontend bisa dipakai untuk dua sumber — daftar dari
 * collection ini maupun daftar yang diketik langsung di block.
 */
export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  access: { read: publishedOrAuthenticated },
  admin: {
    defaultColumns: ['title', 'client', 'industry', '_status'],
    group: 'Konten',
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', label: 'Judul', required: true },
    slugField('Dipakai di /case-study/<slug>.'),
    { name: 'client', type: 'text', label: 'Klien' },
    { name: 'industry', type: 'text', label: 'Industri' },
    { name: 'summary', type: 'textarea', label: 'Ringkasan' },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'value', type: 'text', label: 'Teks', required: true }],
      label: 'Tag',
      labels: { plural: 'Tag', singular: 'Tag' },
    },
    {
      name: 'metrics',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', label: 'Label', required: true },
        { name: 'value', type: 'text', label: 'Nilai' },
      ],
      label: 'Metrik',
      labels: { plural: 'Metrik', singular: 'Metrik' },
      maxRows: 3,
    },
    { name: 'cover', type: 'upload', label: 'Gambar sampul', relationTo: 'media' },
    { name: 'body', type: 'richText', label: 'Isi studi kasus' },
  ],
  labels: { plural: 'Studi Kasus', singular: 'Studi Kasus' },
  versions: { drafts: true, maxPerDoc: 20 },
}
