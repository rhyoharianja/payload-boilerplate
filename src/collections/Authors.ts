import type { CollectionConfig } from 'payload'

import { slugField } from './shared'

/**
 * Penulis artikel.
 *
 * Terpisah dari `Users`: penulis adalah identitas PUBLIK yang tampil di halaman
 * `/blog-author/<slug>`, sementara `Users` adalah akun yang bisa masuk panel
 * admin. Menggabungkannya berarti setiap penulis harus punya akun — dan setiap
 * akun ikut terbit di frontend.
 */
export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    defaultColumns: ['name', 'role', 'updatedAt'],
    group: 'Konten',
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nama', required: true },
    slugField('Dipakai di /blog-author/<slug>.'),
    { name: 'role', type: 'text', label: 'Jabatan' },
    { name: 'bio', type: 'textarea', label: 'Bio' },
    { name: 'photo', type: 'upload', label: 'Foto', relationTo: 'media' },
  ],
  labels: { plural: 'Penulis', singular: 'Penulis' },
}
