import type { Block } from 'payload'

import { headingFields, spacingField } from './fields'

/** Block Testimonials — kutipan nasabah dalam kartu tiga kolom. */
export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'quote', type: 'textarea', label: 'Kutipan', required: true },
        { name: 'name', type: 'text', label: 'Nama', required: true },
        { name: 'role', type: 'text', label: 'Jabatan / perusahaan' },
      ],
      label: 'Daftar testimoni',
      labels: { plural: 'Testimoni', singular: 'Testimoni' },
    },
    spacingField('lg'),
  ],
  labels: { plural: 'Testimonials', singular: 'Testimonials' },
}
