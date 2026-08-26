import type { CollectionConfig } from 'payload'

import { slugField } from './shared'

/** Kategori artikel; tampil di `/blog-genre/<slug>`. */
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    defaultColumns: ['name', 'slug', 'updatedAt'],
    group: 'Konten',
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nama', required: true },
    slugField('Dipakai di /blog-genre/<slug>.'),
    { name: 'description', type: 'textarea', label: 'Deskripsi' },
  ],
  labels: { plural: 'Kategori', singular: 'Kategori' },
}
