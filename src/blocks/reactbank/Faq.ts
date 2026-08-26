import type { Block } from 'payload'

import { headingFields, spacingField, toneField } from './fields'

/** Block FAQ — accordion pertanyaan dengan tombol kontak di sampingnya. */
export const FaqBlock: Block = {
  slug: 'faq',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', label: 'Pertanyaan', required: true },
        { name: 'answer', type: 'textarea', label: 'Jawaban', required: true },
      ],
      label: 'Daftar pertanyaan',
      labels: { plural: 'Pertanyaan', singular: 'Pertanyaan' },
    },
    {
      name: 'limit',
      type: 'number',
      admin: { description: 'Kosongkan untuk menampilkan semuanya.' },
      label: 'Batas jumlah',
      min: 1,
    },
    { name: 'actionLabel', type: 'text', label: 'Label tombol' },
    { name: 'actionHref', type: 'text', label: 'Tujuan tombol' },
    toneField('light'),
    spacingField('lg'),
  ],
  labels: { plural: 'FAQ', singular: 'FAQ' },
}
