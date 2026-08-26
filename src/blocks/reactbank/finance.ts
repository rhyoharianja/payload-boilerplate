import type { Block } from 'payload'

import {
  actionsField,
  headingFields,
  htmlIdField,
  singleActionField,
  spacingField,
  textListField,
  toneField,
} from './fields'

/**
 * Block untuk hero, kalkulator, dan formulir.
 *
 * Perhatikan yang TIDAK ada di sini: rumus angsuran, ambang kelayakan, dan
 * langkah formulir. Semuanya tetap di kode frontend. Yang bisa disunting hanya
 * teks dan nilai awal — memindahkan aturannya ke Payload berarti menyimpan
 * program di dalam dokumen, dan siapa pun yang boleh menyunting halaman jadi
 * bisa mengubah siapa yang dinyatakan layak kredit.
 */

export const HeroBlock: Block = {
  slug: 'hero',
  fields: [
    ...headingFields(),
    { name: 'emailPlaceholder', type: 'text', label: 'Placeholder email' },
    { name: 'submitLabel', type: 'text', label: 'Label tombol kirim' },
    {
      name: 'stats',
      type: 'array',
      fields: [
        { name: 'value', type: 'number', label: 'Angka', required: true },
        { name: 'suffix', type: 'text', label: 'Akhiran' },
        { name: 'label', type: 'text', label: 'Keterangan' },
      ],
      label: 'Statistik',
      labels: { plural: 'Statistik', singular: 'Statistik' },
    },
    {
      name: 'showCalculator',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan kalkulator',
    },
    { name: 'calculatorTitle', type: 'text', label: 'Judul kalkulator' },
    { name: 'resultLabel', type: 'text', label: 'Label hasil' },
    { name: 'defaultMonthly', type: 'number', label: 'Setoran awal per bulan', min: 0 },
    { name: 'defaultYears', type: 'number', label: 'Jangka waktu awal (tahun)', min: 1 },
    { name: 'defaultRate', type: 'number', label: 'Imbal hasil awal (%)', min: 0 },
    singleActionField('Tombol di kalkulator'),
  ],
  labels: { plural: 'Hero', singular: 'Hero' },
}

export const HeroLightBlock: Block = {
  slug: 'heroLight',
  fields: [
    ...headingFields(),
    actionsField(),
    {
      name: 'stats',
      type: 'array',
      fields: [
        { name: 'value', type: 'number', label: 'Angka', required: true },
        {
          name: 'decimals',
          type: 'number',
          admin: { description: 'Jumlah angka di belakang koma pada animasi hitung.' },
          label: 'Desimal',
          min: 0,
        },
        { name: 'suffix', type: 'text', label: 'Akhiran' },
        { name: 'label', type: 'text', label: 'Keterangan' },
      ],
      label: 'Statistik',
      labels: { plural: 'Statistik', singular: 'Statistik' },
    },
    { name: 'showMarquee', type: 'checkbox', defaultValue: true, label: 'Tampilkan marquee mitra' },
    textListField('marqueeItems', 'Isi marquee'),
  ],
  labels: { plural: 'Hero Terang', singular: 'Hero Terang' },
}

export const FxRatesBlock: Block = {
  slug: 'fxRates',
  fields: [
    {
      name: 'rates',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', label: 'Mata uang', required: true },
        { name: 'code', type: 'text', label: 'Kode', required: true },
        { name: 'rate', type: 'number', label: 'Kurs terhadap IDR', required: true },
        { name: 'change', type: 'number', label: 'Perubahan 24 jam (%)' },
      ],
      label: 'Kurs',
      labels: { plural: 'Kurs', singular: 'Kurs' },
    },
    { name: 'defaultAmount', type: 'text', label: 'Jumlah awal' },
    { name: 'defaultFrom', type: 'text', label: 'Mata uang asal' },
    { name: 'defaultTo', type: 'text', label: 'Mata uang tujuan' },
    { name: 'resultLabel', type: 'text', label: 'Label hasil' },
    { name: 'disclaimer', type: 'textarea', label: 'Catatan kaki' },
    toneField('dark'),
  ],
  labels: { plural: 'Kurs Valuta', singular: 'Kurs Valuta' },
}

export const CalculatorTabsBlock: Block = {
  slug: 'calculatorTabs',
  fields: [
    ...headingFields(),
    { name: 'tabsLabel', type: 'text', label: 'Label nav tab' },
    { name: 'showLoan', type: 'checkbox', defaultValue: true, label: 'Tab angsuran kredit' },
    { name: 'loanLabel', type: 'text', label: 'Label tab angsuran' },
    { name: 'showFx', type: 'checkbox', defaultValue: true, label: 'Tab konversi valuta' },
    { name: 'fxLabel', type: 'text', label: 'Label tab valuta' },
    {
      name: 'showComparison',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tab perbandingan produk',
    },
    { name: 'comparisonLabel', type: 'text', label: 'Label tab perbandingan' },
    {
      name: 'comparisonRows',
      type: 'array',
      fields: [
        { name: 'product', type: 'text', label: 'Produk', required: true },
        { name: 'rate', type: 'text', label: 'Bunga mulai' },
        { name: 'tenor', type: 'text', label: 'Tenor maksimum' },
        { name: 'fee', type: 'text', label: 'Provisi' },
        { name: 'payout', type: 'text', label: 'Pencairan' },
      ],
      label: 'Baris perbandingan',
      labels: { plural: 'Baris', singular: 'Baris' },
    },
    htmlIdField('kalkulator'),
    spacingField('lg'),
  ],
  labels: { plural: 'Tab Kalkulator', singular: 'Tab Kalkulator' },
}

export const LoanCalculatorBlock: Block = {
  slug: 'loanCalculator',
  fields: [
    ...headingFields(),
    { name: 'defaultAmount', type: 'number', label: 'Plafon awal', min: 0 },
    { name: 'defaultRate', type: 'number', label: 'Bunga awal (%)', min: 0 },
    { name: 'defaultMonths', type: 'number', label: 'Tenor awal (bulan)', min: 1 },
    htmlIdField('kalkulator'),
    spacingField('lg'),
  ],
  labels: { plural: 'Kalkulator Angsuran', singular: 'Kalkulator Angsuran' },
}

export const SavingsCalculatorBlock: Block = {
  slug: 'savingsCalculator',
  fields: [
    ...headingFields(),
    { name: 'defaultInitial', type: 'number', label: 'Saldo awal', min: 0 },
    { name: 'defaultMonthly', type: 'number', label: 'Setoran per bulan', min: 0 },
    { name: 'defaultRate', type: 'number', label: 'Imbal hasil (%)', min: 0 },
    { name: 'defaultYears', type: 'number', label: 'Jangka waktu (tahun)', min: 1 },
    htmlIdField('proyeksi'),
    spacingField('lg'),
  ],
  labels: { plural: 'Proyeksi Tabungan', singular: 'Proyeksi Tabungan' },
}

export const EligibilityFormBlock: Block = {
  slug: 'eligibilityForm',
  fields: [...headingFields(), spacingField('lg')],
  labels: { plural: 'Cek Kelayakan', singular: 'Cek Kelayakan' },
}

export const LoanFormBlock: Block = {
  slug: 'loanForm',
  fields: [...headingFields(), htmlIdField('formulir'), spacingField('lg')],
  labels: { plural: 'Formulir Pengajuan', singular: 'Formulir Pengajuan' },
}

export const TransactionHistoryBlock: Block = {
  slug: 'transactionHistory',
  fields: [
    ...headingFields(),
    {
      name: 'items',
      type: 'array',
      fields: [
        // Bukan `id`: nama itu sudah dipakai Payload untuk identitas baris array.
        { name: 'reference', type: 'text', label: 'ID transaksi', required: true },
        { name: 'date', type: 'text', label: 'Tanggal' },
        { name: 'description', type: 'text', label: 'Keterangan' },
        {
          name: 'amount',
          type: 'number',
          admin: { description: 'Negatif untuk pengeluaran.' },
          label: 'Nominal',
        },
      ],
      label: 'Transaksi',
      labels: { plural: 'Transaksi', singular: 'Transaksi' },
    },
    spacingField('md'),
  ],
  labels: { plural: 'Riwayat Transaksi', singular: 'Riwayat Transaksi' },
}
