import type { GlobalConfig } from 'payload'

/**
 * Identitas situs: nama, tagline, dan kanal kontak.
 *
 * Dipisah dari Header/Footer karena dipakai keduanya DAN oleh metadata halaman.
 * Kalau ditaruh di salah satunya, yang lain harus mengambil dari global yang
 * namanya tidak ada hubungannya dengan isinya.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'Pengaturan Situs' },
  fields: [
    { name: 'name', type: 'text', label: 'Nama situs', required: true },
    { name: 'tagline', type: 'text', label: 'Tagline' },
    { name: 'logo', type: 'upload', label: 'Logo', relationTo: 'media' },
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'email', type: 'email', label: 'Email' },
        { name: 'phone', type: 'text', label: 'Telepon' },
        { name: 'address', type: 'textarea', label: 'Alamat' },
      ],
      label: 'Kontak',
    },
  ],
  label: 'Pengaturan Situs',
}
