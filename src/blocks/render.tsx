// Komponen milik FRONTEND, di-import lintas folder lewat alias `@fe/*`.
//
// Inilah yang membuat canvas Puck jujur: komponen yang dirender editor adalah
// komponen yang sama persis dengan yang tayang di NEXT-REACTBANK. Kalau canvas
// memakai salinan tersendiri, ia menampilkan sesuatu yang tidak pernah terbit.
//
// Alias `@fe/*` menunjuk `../NEXT-REACTBANK/src/*`, yang sudah berada di dalam
// `turbopack.root` aplikasi ini sehingga ikut ter-compile tanpa paket terpisah.
export { type BlockComponent, blockComponents } from '@fe/blocks/registry'

/**
 * Peta render block untuk canvas Puck.
 *
 * Berkas ini sengaja tidak punya isi sendiri — hanya meneruskan peta milik
 * frontend. Satu daftar, dipakai frontend produksi maupun canvas editor, jadi
 * tidak ada yang bisa menyimpang diam-diam.
 */
