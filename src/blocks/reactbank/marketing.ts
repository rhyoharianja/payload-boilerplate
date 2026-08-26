import type { Block } from 'payload'

import {
  actionsField,
  headingFields,
  htmlIdField,
  limitField,
  singleActionField,
  spacingField,
  textListField,
  toneField,
} from './fields'

/**
 * Block bercerita: profil perusahaan, bukti sosial, dan jangkauan operasional.
 *
 * Nama field WAJIB identik dengan nama props komponennya di `NEXT-REACTBANK`.
 * Puck maupun `BlockRenderer` meneruskan baris block apa adanya sebagai props,
 * jadi kesamaan nama itulah satu-satunya yang menyambungkan keduanya. Nama yang
 * meleset tidak memunculkan error — nilainya hanya diam-diam hilang.
 */

export const AboutBlock: Block = {
  slug: 'about',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', label: 'Judul', required: true },
        { name: 'detail', type: 'textarea', label: 'Keterangan' },
      ],
      label: 'Pilar',
      labels: { plural: 'Pilar', singular: 'Pilar' },
    },
    actionsField(),
    spacingField('lg'),
  ],
  labels: { plural: 'Tentang Kami', singular: 'Tentang Kami' },
}

export const AdvantagesBlock: Block = {
  slug: 'advantages',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'number', type: 'text', label: 'Nomor' },
        { name: 'title', type: 'text', label: 'Judul', required: true },
        { name: 'description', type: 'textarea', label: 'Deskripsi' },
      ],
      label: 'Keunggulan',
      labels: { plural: 'Keunggulan', singular: 'Keunggulan' },
    },
    { name: 'highlight', type: 'text', label: 'Angka sorotan' },
    { name: 'highlightDetail', type: 'textarea', label: 'Keterangan sorotan' },
    spacingField('md'),
  ],
  labels: { plural: 'Kenapa Kami', singular: 'Kenapa Kami' },
}

export const AwardsBlock: Block = {
  slug: 'awards',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'year', type: 'text', label: 'Tahun' },
        { name: 'title', type: 'text', label: 'Penghargaan', required: true },
        { name: 'issuer', type: 'text', label: 'Pemberi' },
        { name: 'detail', type: 'textarea', label: 'Dasar penilaian' },
      ],
      label: 'Penghargaan',
      labels: { plural: 'Penghargaan', singular: 'Penghargaan' },
    },
    spacingField('lg'),
  ],
  labels: { plural: 'Penghargaan', singular: 'Penghargaan' },
}

export const ClientReviewsBlock: Block = {
  slug: 'clientReviews',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'quote', type: 'textarea', label: 'Kutipan', required: true },
        { name: 'name', type: 'text', label: 'Nama' },
        { name: 'role', type: 'text', label: 'Jabatan' },
      ],
      label: 'Ulasan',
      labels: { plural: 'Ulasan', singular: 'Ulasan' },
    },
    toneField('light'),
    spacingField('lg'),
  ],
  labels: { plural: 'Ulasan Nasabah', singular: 'Ulasan Nasabah' },
}

export const IntegrationsBlock: Block = {
  slug: 'integrations',
  fields: [
    ...headingFields(),
    textListField('items', 'Nama integrasi'),
    { name: 'actionLabel', type: 'text', label: 'Label tombol' },
    { name: 'actionHref', type: 'text', label: 'Tujuan tombol' },
    toneField('dark'),
    spacingField('lg'),
  ],
  labels: { plural: 'Integrasi', singular: 'Integrasi' },
}

export const ServicesGridBlock: Block = {
  slug: 'servicesGrid',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', label: 'Judul', required: true },
        { name: 'description', type: 'textarea', label: 'Deskripsi' },
        {
          name: 'accent',
          type: 'select',
          admin: { description: 'Warna aksen kartu; hanya token yang ada di design system.' },
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
        },
      ],
      label: 'Layanan',
      labels: { plural: 'Layanan', singular: 'Layanan' },
    },
    spacingField('md'),
  ],
  labels: { plural: 'Grid Layanan', singular: 'Grid Layanan' },
}

export const StepFlowBlock: Block = {
  slug: 'stepFlow',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'number',
          type: 'text',
          admin: { description: 'Kosongkan untuk penomoran otomatis.' },
          label: 'Nomor',
        },
        { name: 'title', type: 'text', label: 'Judul', required: true },
        { name: 'detail', type: 'textarea', label: 'Keterangan' },
      ],
      label: 'Langkah',
      labels: { plural: 'Langkah', singular: 'Langkah' },
    },
    toneField('light'),
    spacingField('lg'),
  ],
  labels: { plural: 'Alur Langkah', singular: 'Alur Langkah' },
}

export const TeamBlock: Block = {
  slug: 'team',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', label: 'Nama', required: true },
        { name: 'role', type: 'text', label: 'Jabatan' },
        { name: 'focus', type: 'text', label: 'Fokus' },
      ],
      label: 'Anggota tim',
      labels: { plural: 'Anggota', singular: 'Anggota' },
    },
    spacingField('lg'),
  ],
  labels: { plural: 'Tim', singular: 'Tim' },
}

export const TrustIndicatorsBlock: Block = {
  slug: 'trustIndicators',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'value', type: 'text', label: 'Angka', required: true },
        { name: 'label', type: 'text', label: 'Keterangan' },
      ],
      label: 'Indikator',
      labels: { plural: 'Indikator', singular: 'Indikator' },
    },
    spacingField('md'),
  ],
  labels: { plural: 'Indikator Kepercayaan', singular: 'Indikator Kepercayaan' },
}

export const SecurityProtocolsBlock: Block = {
  slug: 'securityProtocols',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', label: 'Judul', required: true },
        { name: 'detail', type: 'textarea', label: 'Keterangan' },
      ],
      label: 'Protokol',
      labels: { plural: 'Protokol', singular: 'Protokol' },
    },
    spacingField('lg'),
  ],
  labels: { plural: 'Protokol Keamanan', singular: 'Protokol Keamanan' },
}

export const TechStackBlock: Block = {
  slug: 'techStack',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', label: 'Teknologi', required: true },
        { name: 'role', type: 'text', label: 'Perannya' },
      ],
      label: 'Teknologi',
      labels: { plural: 'Teknologi', singular: 'Teknologi' },
    },
    spacingField('md'),
  ],
  labels: { plural: 'Teknologi', singular: 'Teknologi' },
}

export const GlobalInfrastructureBlock: Block = {
  slug: 'globalInfrastructure',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'city', type: 'text', label: 'Kota', required: true },
        { name: 'detail', type: 'text', label: 'Keterangan' },
        { name: 'role', type: 'text', label: 'Peran' },
        {
          name: 'mapLeft',
          type: 'text',
          admin: {
            description: 'Posisi penanda di peta, mis. "62%". Kosong memakai posisi bawaan.',
          },
          label: 'Posisi X',
        },
        { name: 'mapTop', type: 'text', label: 'Posisi Y' },
      ],
      label: 'Lokasi',
      labels: { plural: 'Lokasi', singular: 'Lokasi' },
    },
    toneField('dark'),
    spacingField('lg'),
  ],
  labels: { plural: 'Infrastruktur Global', singular: 'Infrastruktur Global' },
}

export const CaseStudiesBlock: Block = {
  slug: 'caseStudies',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'client', type: 'text', label: 'Klien' },
        { name: 'title', type: 'text', label: 'Judul', required: true },
        { name: 'summary', type: 'textarea', label: 'Ringkasan' },
        { name: 'slug', type: 'text', label: 'Slug halaman detail' },
        textListField('tags', 'Tag'),
        {
          name: 'metrics',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', label: 'Label', required: true },
            { name: 'value', type: 'text', label: 'Nilai' },
          ],
          label: 'Metrik',
          labels: { plural: 'Metrik', singular: 'Metrik' },
          maxRows: 3,
        },
      ],
      label: 'Studi kasus',
      labels: { plural: 'Studi kasus', singular: 'Studi kasus' },
    },
    limitField(),
    spacingField('lg'),
  ],
  labels: { plural: 'Studi Kasus', singular: 'Studi Kasus' },
}

export const LoanCategoriesBlock: Block = {
  slug: 'loanCategories',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', label: 'Nama kategori', required: true },
        { name: 'rate', type: 'text', label: 'Bunga' },
        { name: 'tenor', type: 'text', label: 'Tenor' },
        { name: 'limit', type: 'text', label: 'Plafon' },
      ],
      label: 'Kategori',
      labels: { plural: 'Kategori', singular: 'Kategori' },
    },
    singleActionField('Tombol pada tiap kartu'),
    htmlIdField('kategori'),
    spacingField('lg'),
  ],
  labels: { plural: 'Kategori Pinjaman', singular: 'Kategori Pinjaman' },
}
