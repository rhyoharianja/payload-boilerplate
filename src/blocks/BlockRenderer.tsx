/**
 * Renderer block untuk route frontend bawaan CMS ini.
 *
 * Isinya diteruskan dari FRONTEND, bukan ditulis ulang. Sebelumnya berkas ini
 * memuat salinan logika yang sama persis — dua implementasi dengan aturan
 * fail-soft dan batas kedalaman yang harus dijaga tetap sama, tanpa apa pun yang
 * memaksanya. Salinan seperti itu tidak berbeda saat ditulis; ia berbeda enam
 * bulan kemudian, di satu sisi saja, dan bedanya baru terlihat sebagai blok yang
 * hilang di satu tempat.
 */
export { type BlockRow, BlockRenderer } from '@fe/blocks/registry'
