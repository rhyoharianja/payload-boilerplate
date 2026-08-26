import type { Block, Field } from 'payload'

import { actionsField, headingFields, spacingField, textListField, toneField } from './fields'

/**
 * Block serbaguna: bentuk yang dulu ditulis tangan di berkas halaman.
 *
 * Sembilan halaman punya satu sampai enam section buatan sendiri — grid kartu
 * fitur, daftar sertifikasi, cuplikan kode, ajakan bertindak. Tanpa block ini,
 * memindahkan halaman-halaman itu ke CMS berarti kehilangan bagian isinya tanpa
 * ada yang menandai.
 */

/** Perataan judul; beberapa section memakai judul di tengah. */
const alignField = (): Field => ({
  name: 'align',
  type: 'select',
  defaultValue: 'left',
  label: 'Perataan judul',
  options: [
    { label: 'Kiri', value: 'left' },
    { label: 'Tengah', value: 'center' },
  ],
})

const columnsField = (defaultValue: string): Field => ({
  name: 'columns',
  type: 'select',
  defaultValue,
  label: 'Jumlah kolom',
  options: [
    { label: 'Dua', value: '2' },
    { label: 'Tiga', value: '3' },
    { label: 'Empat', value: '4' },
  ],
})

/** Token aksen design system; sama dengan yang dipakai block servicesGrid. */
const accentField = (): Field => ({
  name: 'accent',
  type: 'select',
  defaultValue: 'primary',
  label: 'Aksen',
  options: [
    { label: 'Primary', value: 'primary' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Cool blue', value: 'cool_blue' },
    { label: 'Marine', value: 'marine' },
    { label: 'Wine berry', value: 'wine_berry' },
    { label: 'Navy green', value: 'navy_green' },
  ],
})

export const FeatureGridBlock: Block = {
  slug: 'featureGrid',
  fields: [
    ...headingFields(),
    alignField(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', label: 'Judul', required: true },
        { name: 'description', type: 'textarea', label: 'Deskripsi' },
        accentField(),
      ],
      label: 'Kartu',
      labels: { plural: 'Kartu', singular: 'Kartu' },
    },
    columnsField('3'),
    {
      name: 'variant',
      type: 'select',
      admin: { description: '"Kaca" hanya terbaca di atas latar gelap.' },
      defaultValue: 'solid',
      label: 'Gaya kartu',
      options: [
        { label: 'Padat', value: 'solid' },
        { label: 'Garis', value: 'outline' },
        { label: 'Kaca', value: 'glass' },
      ],
    },
    spacingField('md'),
  ],
  labels: { plural: 'Grid Fitur', singular: 'Grid Fitur' },
}

export const CardGridBlock: Block = {
  slug: 'cardGrid',
  fields: [
    ...headingFields(),
    alignField(),
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          admin: { description: 'Teks kecil di atas judul, mis. tahun pada linimasa.' },
          label: 'Teks atas',
        },
        { name: 'title', type: 'text', label: 'Judul', required: true },
        { name: 'detail', type: 'textarea', label: 'Keterangan' },
      ],
      label: 'Kartu',
      labels: { plural: 'Kartu', singular: 'Kartu' },
    },
    columnsField('4'),
    spacingField('md'),
  ],
  labels: { plural: 'Grid Kartu', singular: 'Grid Kartu' },
}

export const CodeSampleBlock: Block = {
  slug: 'codeSample',
  fields: [
    ...headingFields(),
    {
      name: 'code',
      type: 'textarea',
      admin: { description: 'Ditampilkan apa adanya dengan huruf monospace, termasuk indentasi.' },
      label: 'Cuplikan kode',
      required: true,
    },
    spacingField('md'),
  ],
  labels: { plural: 'Cuplikan Kode', singular: 'Cuplikan Kode' },
}

export const VideoFeatureBlock: Block = {
  slug: 'videoFeature',
  fields: [
    ...headingFields(),
    { name: 'videoTitle', type: 'text', label: 'Judul video', required: true },
    { name: 'caption', type: 'text', label: 'Keterangan di bawah pemutar' },
    spacingField('md'),
  ],
  labels: { plural: 'Video', singular: 'Video' },
}

export const CallToActionBlock: Block = {
  slug: 'callToAction',
  fields: [...headingFields(), actionsField(), toneField('light'), spacingField('md')],
  labels: { plural: 'Ajakan Bertindak', singular: 'Ajakan Bertindak' },
}

export const ProseBlock: Block = {
  slug: 'prose',
  fields: [
    ...headingFields(),
    {
      name: 'content',
      type: 'richText',
      admin: {
        description:
          'Disunting di sini, bukan di canvas Puck — Puck tidak menerima field rich text.',
      },
      label: 'Isi',
    },
    spacingField('lg'),
  ],
  labels: { plural: 'Teks Panjang', singular: 'Teks Panjang' },
}

export const ContactPanelBlock: Block = {
  slug: 'contactPanel',
  fields: [
    { name: 'channelsLabel', type: 'text', label: 'Label kanal' },
    { name: 'channelsTitle', type: 'text', label: 'Judul kanal' },
    {
      name: 'channels',
      type: 'array',
      admin: {
        description:
          'Kosongkan untuk memakai kontak dari Pengaturan Situs. Baris di sini menimpanya.',
      },
      fields: [
        { name: 'label', type: 'text', label: 'Label', required: true },
        { name: 'value', type: 'text', label: 'Isi', required: true },
        { name: 'href', type: 'text', label: 'Tautan' },
      ],
      label: 'Kanal kontak',
      labels: { plural: 'Kanal', singular: 'Kanal' },
    },
    { name: 'formTitle', type: 'text', label: 'Judul formulir' },
    {
      name: 'topics',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', label: 'Label', required: true },
        { name: 'value', type: 'text', label: 'Nilai', required: true },
      ],
      label: 'Pilihan topik',
      labels: { plural: 'Topik', singular: 'Topik' },
    },
    { name: 'submitLabel', type: 'text', label: 'Label tombol kirim' },
    spacingField('lg'),
  ],
  labels: { plural: 'Panel Kontak', singular: 'Panel Kontak' },
}

export const PricingPlansBlock: Block = {
  slug: 'pricingPlans',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', label: 'Nama paket', required: true },
        { name: 'price', type: 'text', label: 'Harga' },
        { name: 'note', type: 'text', label: 'Catatan di bawah harga' },
        textListField('features', 'Fitur'),
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'outline',
          label: 'Gaya kartu',
          options: [
            { label: 'Garis', value: 'outline' },
            { label: 'Padat', value: 'solid' },
          ],
        },
        { name: 'highlight', type: 'checkbox', defaultValue: false, label: 'Tonjolkan' },
        {
          name: 'highlightLabel',
          type: 'text',
          admin: { condition: (_, sibling) => Boolean(sibling?.highlight) },
          label: 'Label penonjolan',
        },
      ],
      label: 'Paket',
      labels: { plural: 'Paket', singular: 'Paket' },
      maxRows: 3,
    },
    spacingField('md'),
  ],
  labels: { plural: 'Paket Harga', singular: 'Paket Harga' },
}
