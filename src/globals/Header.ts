import type { GlobalConfig } from 'payload'

/**
 * Navigasi utama dan mega menu.
 *
 * Dua daftar terpisah, bukan satu, karena keduanya memang berbeda di frontend:
 * `mainNav` adalah menu dropdown biasa, `megaMenu` adalah panel lebar dengan
 * deskripsi per butir. Menggabungkannya berarti satu daftar yang harus
 * berperilaku dua cara, dan editor tidak punya cara melihat mana yang mana.
 *
 * Butir `mainNav` boleh punya `href` ATAU `children`, tidak keduanya: yang punya
 * anak berperan sebagai pembuka dropdown. Payload tidak bisa memaksakan aturan
 * itu di skema, jadi ia ditegakkan frontend dan dijelaskan di sini.
 */
export const Header: GlobalConfig = {
  slug: 'header',
  admin: { group: 'Pengaturan Situs' },
  fields: [
    {
      name: 'mainNav',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', label: 'Label', required: true },
        {
          name: 'href',
          type: 'text',
          admin: { description: 'Kosongkan bila butir ini hanya pembuka dropdown.' },
          label: 'Tujuan',
        },
        {
          name: 'children',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', label: 'Label', required: true },
            { name: 'href', type: 'text', label: 'Tujuan', required: true },
            { name: 'description', type: 'text', label: 'Keterangan' },
          ],
          label: 'Submenu',
          labels: { plural: 'Butir', singular: 'Butir' },
        },
      ],
      label: 'Menu utama',
      labels: { plural: 'Butir', singular: 'Butir' },
    },
    {
      name: 'megaMenu',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', label: 'Judul kolom', required: true },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', label: 'Label', required: true },
            { name: 'href', type: 'text', label: 'Tujuan', required: true },
            { name: 'description', type: 'text', label: 'Keterangan' },
          ],
          label: 'Butir',
          labels: { plural: 'Butir', singular: 'Butir' },
        },
      ],
      label: 'Mega menu',
      labels: { plural: 'Kolom', singular: 'Kolom' },
    },
    {
      name: 'action',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', label: 'Label' },
        { name: 'href', type: 'text', label: 'Tujuan' },
      ],
      label: 'Tombol kanan atas',
    },
  ],
  label: 'Header & Navigasi',
}
