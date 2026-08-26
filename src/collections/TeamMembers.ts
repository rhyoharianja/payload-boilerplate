import type { CollectionConfig } from 'payload'

/** Anggota tim yang tampil di section Tim. */
export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  admin: {
    defaultColumns: ['name', 'role', 'updatedAt'],
    group: 'Konten',
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nama', required: true },
    { name: 'role', type: 'text', label: 'Jabatan' },
    { name: 'focus', type: 'text', label: 'Fokus' },
    { name: 'photo', type: 'upload', label: 'Foto', relationTo: 'media' },
  ],
  labels: { plural: 'Anggota Tim', singular: 'Anggota Tim' },
}
