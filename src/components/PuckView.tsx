'use client'

import { createPuckView } from 'payload-puck-advance/client'

import { puckCategories } from '@/blocks'
import { blockComponents } from '@/blocks/render'
import { PuckCanvasStyles } from './PuckCanvasStyles'

/**
 * View Puck untuk aplikasi ini.
 *
 * `renderMap` memakai komponen block yang SAMA dengan frontend produksi — itu yang
 * membuat canvas jujur. Plugin tidak membawa komponen apa pun; ia hanya menurunkan
 * panel field dari definisi block Payload dan menyambungkan penyimpanannya.
 *
 * Penyuntik stylesheet canvas DIGANTI dengan milik sendiri. Yang bawaan
 * memasang href stylesheet apa adanya, dan href Next bersifat relatif — di
 * iframe canvas ia di-resolve ke origin CMS lalu 404. Lihat PuckCanvasStyles.
 */
export const PuckView = createPuckView({
  // Katalog dikelompokkan mengikuti alur halaman. Tiga puluh satu block dalam
  // satu daftar datar memaksa editor menggulir tanpa tahu di mana batas antar
  // jenis; kelompoknya diturunkan dari daftar yang sama yang mengisi field
  // `layout`, jadi urutan di form dan di katalog tidak bisa berbeda.
  categories: puckCategories,
  iframeOverride: PuckCanvasStyles,
  renderMap: blockComponents,
})

export default PuckView
