import type { GlobalConfig } from 'payload'

/** Kolom tautan dan catatan hak cipta di kaki halaman. */
export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: { group: 'Pengaturan Situs' },
  fields: [
    {
      name: 'columns',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', label: 'Judul kolom', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', label: 'Label', required: true },
            { name: 'href', type: 'text', label: 'Tujuan', required: true },
          ],
          label: 'Tautan',
          labels: { plural: 'Tautan', singular: 'Tautan' },
        },
      ],
      label: 'Kolom tautan',
      labels: { plural: 'Kolom', singular: 'Kolom' },
    },
    {
      name: 'note',
      type: 'textarea',
      admin: { description: 'Muncul di bawah kolom tautan. Tahun diisi frontend.' },
      label: 'Catatan kaki',
    },
    {
      name: 'socials',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', label: 'Nama', required: true },
        { name: 'href', type: 'text', label: 'Tautan', required: true },
      ],
      label: 'Media sosial',
      labels: { plural: 'Kanal', singular: 'Kanal' },
    },
  ],
  label: 'Footer',
}
