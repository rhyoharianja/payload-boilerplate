import type { Block } from 'payload'

import { actionsField, headingFields, spacingField, toneField } from './fields'

/**
 * Block Benefits — daftar keunggulan dengan visual kartu debit.
 *
 * Nama field di sini sengaja identik dengan nama props `<Benefits>` di
 * frontend. Puck mengirim nilai field apa adanya sebagai props, jadi kesamaan
 * nama itulah yang membuat editor dan halaman tayang menampilkan hal yang sama.
 */
export const BenefitsBlock: Block = {
  slug: 'benefits',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', label: 'Judul', required: true },
        { name: 'description', type: 'textarea', label: 'Deskripsi' },
      ],
      label: 'Daftar keunggulan',
      labels: { plural: 'Keunggulan', singular: 'Keunggulan' },
    },
    actionsField(),
    {
      name: 'showCard',
      type: 'checkbox',
      admin: { description: 'Matikan bila section dipakai sebagai daftar polos.' },
      defaultValue: true,
      label: 'Tampilkan visual kartu',
    },
    toneField('dark'),
    spacingField('lg'),
  ],
  labels: { plural: 'Benefits', singular: 'Benefits' },
}
