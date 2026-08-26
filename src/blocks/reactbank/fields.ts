import type { Field } from 'payload'

/**
 * Field varian yang dipakai berulang oleh block ReactBank.
 *
 * Nilai `value` di sini WAJIB sama persis dengan tipe props komponennya di
 * `NEXT-REACTBANK`. Kalau meleset, Payload menyimpan nilai yang tidak dikenal
 * komponen dan section-nya diam-diam jatuh ke default — terlihat seperti
 * pilihan yang tidak berfungsi, bukan seperti kesalahan konfigurasi.
 *
 * Karena itu semua opsi dikumpulkan di satu tempat, bukan disalin per block.
 */

/** `tone` pada `<Section>`: latar terang atau gelap. */
export const toneField = (defaultValue: 'dark' | 'light' = 'light'): Field => ({
  name: 'tone',
  type: 'select',
  defaultValue,
  label: 'Nada latar',
  options: [
    { label: 'Terang', value: 'light' },
    { label: 'Gelap', value: 'dark' },
  ],
})

/** `spacing` pada `<Section>`: ritme padding vertikal dari design system. */
export const spacingField = (defaultValue: 'lg' | 'md' = 'lg'): Field => ({
  name: 'spacing',
  type: 'select',
  defaultValue,
  label: 'Jarak vertikal',
  options: [
    { label: 'Besar', value: 'lg' },
    { label: 'Sedang', value: 'md' },
    { label: 'Besar → Sedang', value: 'lg-md' },
    { label: 'Sedang → Besar', value: 'md-lg' },
    { label: 'Tanpa jarak', value: 'none' },
  ],
})

/** Varian tombol, sesuai `ButtonVariant` di frontend. */
export const buttonVariantField = (defaultValue: string = 'primary'): Field => ({
  name: 'variant',
  type: 'select',
  defaultValue,
  label: 'Varian',
  options: [
    { label: 'Primary', value: 'primary' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Solid hitam', value: 'solid-black' },
    { label: 'Solid putih', value: 'solid-white' },
    { label: 'Garis primary', value: 'outline-primary' },
    { label: 'Garis putih', value: 'outline-white' },
    { label: 'Garis gelap', value: 'outline-dark' },
  ],
})

/** Blok judul section: label kecil, judul, deskripsi. */
export const headingFields = (): Field[] => [
  { name: 'label', type: 'text', label: 'Label kecil' },
  { name: 'title', type: 'text', label: 'Judul' },
  { name: 'description', type: 'textarea', label: 'Deskripsi' },
]

/** Array tombol aksi. */
export const actionsField = (maxRows = 2): Field => ({
  name: 'actions',
  type: 'array',
  fields: [
    { name: 'label', type: 'text', label: 'Label', required: true },
    { name: 'href', type: 'text', label: 'Tujuan' },
    buttonVariantField(),
  ],
  label: 'Tombol',
  labels: { plural: 'Tombol', singular: 'Tombol' },
  maxRows,
})

/**
 * Daftar teks polos.
 *
 * Payload tidak punya array string; setiap baris array selalu objek. Komponen
 * frontend menormalkannya lewat `toStringList`, jadi nama field di dalam baris
 * WAJIB `value`.
 */
export const textListField = (name: string, label: string): Field => ({
  name,
  type: 'array',
  fields: [{ name: 'value', type: 'text', label: 'Teks', required: true }],
  label,
  labels: { plural: 'Baris', singular: 'Baris' },
})

/** Satu tombol tunggal (bukan array), untuk section yang hanya punya satu aksi. */
export const singleActionField = (label = 'Tombol'): Field => ({
  name: 'action',
  type: 'group',
  fields: [
    { name: 'label', type: 'text', label: 'Label' },
    { name: 'href', type: 'text', label: 'Tujuan' },
    buttonVariantField(),
  ],
  label,
})

/**
 * Anchor `id` section.
 *
 * Beberapa section jadi tujuan tautan "#kalkulator" atau "#formulir" dari
 * halaman lain. Kalau editor memindahkan section-nya, tautan itu ikut pindah;
 * kalau id-nya dihapus, tautannya mati tanpa pesan apa pun.
 */
export const htmlIdField = (defaultValue?: string): Field => ({
  name: 'htmlId',
  type: 'text',
  admin: { description: 'Tujuan tautan "#" ke section ini. Kosongkan bila tidak dipakai.' },
  defaultValue,
  label: 'Anchor id',
})

/** Batas jumlah item yang ditampilkan; kosong berarti semuanya. */
export const limitField = (): Field => ({
  name: 'limit',
  type: 'number',
  admin: { description: 'Kosongkan untuk menampilkan semua.' },
  label: 'Batas jumlah',
  min: 1,
})
