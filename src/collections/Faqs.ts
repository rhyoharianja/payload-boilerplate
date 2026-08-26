import type { CollectionConfig } from 'payload'

/**
 * Pertanyaan yang sering diajukan.
 *
 * Dijadikan collection karena dipakai ulang di beberapa halaman. Block `faq`
 * tetap bisa membawa daftarnya sendiri — collection ini untuk yang perlu sama
 * di mana-mana, block untuk yang khusus satu halaman.
 */
export const Faqs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    defaultColumns: ['question', 'updatedAt'],
    group: 'Konten',
    useAsTitle: 'question',
  },
  fields: [
    { name: 'question', type: 'text', label: 'Pertanyaan', required: true },
    { name: 'answer', type: 'textarea', label: 'Jawaban', required: true },
  ],
  labels: { plural: 'FAQ', singular: 'FAQ' },
}
