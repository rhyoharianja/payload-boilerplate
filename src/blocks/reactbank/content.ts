import type { Block } from 'payload'

import { actionsField, headingFields, spacingField, textListField } from './fields'

/**
 * Block yang menampilkan daftar tulisan, dokumen, dan banner halaman dalam.
 *
 * Sama seperti block lain: nama field mengikuti nama props komponennya di
 * `NEXT-REACTBANK`, bukan sebaliknya.
 */

/** Field satu kartu artikel — dipakai oleh blogGrid maupun blogPreview. */
const postFields = [
  { label: 'Judul', name: 'title', required: true, type: 'text' as const },
  { label: 'Ringkasan', name: 'excerpt', type: 'textarea' as const },
  { label: 'Kategori', name: 'category', type: 'text' as const },
  { label: 'Slug kategori', name: 'categorySlug', type: 'text' as const },
  { label: 'Tanggal', name: 'date', type: 'text' as const },
  { label: 'Lama baca', name: 'readingTime', type: 'text' as const },
  { label: 'Slug artikel', name: 'slug', type: 'text' as const },
]

export const BlogPreviewBlock: Block = {
  slug: 'blogPreview',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: postFields,
      label: 'Artikel',
      labels: { plural: 'Artikel', singular: 'Artikel' },
    },
    actionsField(1),
    spacingField('lg'),
  ],
  labels: { plural: 'Cuplikan Blog', singular: 'Cuplikan Blog' },
}

export const BlogGridBlock: Block = {
  slug: 'blogGrid',
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: postFields,
      label: 'Artikel',
      labels: { plural: 'Artikel', singular: 'Artikel' },
    },
    {
      name: 'emptyMessage',
      type: 'text',
      admin: { description: 'Ditampilkan bila daftar artikel kosong.' },
      label: 'Pesan kosong',
    },
  ],
  labels: { plural: 'Grid Artikel', singular: 'Grid Artikel' },
}

export const DocumentsBlock: Block = {
  slug: 'documents',
  fields: [
    ...headingFields(),
    { name: 'tabsLabel', type: 'text', label: 'Label nav tab' },
    {
      name: 'groups',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', label: 'Nama tab', required: true },
        textListField('items', 'Dokumen'),
      ],
      label: 'Profil pemohon',
      labels: { plural: 'Profil', singular: 'Profil' },
    },
    spacingField('lg'),
  ],
  labels: { plural: 'Dokumen', singular: 'Dokumen' },
}

export const CreditTiersBlock: Block = {
  slug: 'creditTiers',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'tier', type: 'text', label: 'Tingkat', required: true },
        { name: 'score', type: 'text', label: 'Rentang skor' },
        { name: 'rate', type: 'text', label: 'Bunga' },
        { name: 'detail', type: 'textarea', label: 'Catatan' },
      ],
      label: 'Tingkat',
      labels: { plural: 'Tingkat', singular: 'Tingkat' },
    },
    spacingField('md'),
  ],
  labels: { plural: 'Tingkat Kredit', singular: 'Tingkat Kredit' },
}

export const PageHeroBlock: Block = {
  slug: 'pageHero',
  fields: [
    ...headingFields(),
    {
      name: 'breadcrumbs',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', label: 'Label', required: true },
        {
          name: 'href',
          type: 'text',
          admin: { description: 'Kosongkan untuk butir terakhir yang bukan tautan.' },
          label: 'Tujuan',
        },
      ],
      label: 'Breadcrumb',
      labels: { plural: 'Butir', singular: 'Butir' },
    },
    { name: 'homeLabel', type: 'text', label: 'Label tautan beranda' },
  ],
  labels: { plural: 'Banner Halaman', singular: 'Banner Halaman' },
}
