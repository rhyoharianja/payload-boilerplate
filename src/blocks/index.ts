import { reactbankBlocks } from './reactbank'

/**
 * Block yang boleh berdiri di tingkat teratas halaman.
 *
 * Semuanya dirender komponen section milik `../../../NEXT-REACTBANK`.
 *
 * Tiga block demo bawaan boilerplate (Hero/Grid/Stats) sudah DIHAPUS. Bukan
 * karena rusak, tapi karena ditulis dengan token shadcn milik CMS
 * (`bg-muted`, `text-primary-foreground`), sementara canvas Puck memakai
 * stylesheet FRONTEND. Tailwind hanya menghasilkan kelas dari sumber yang
 * dipindainya, jadi kelas itu tidak pernah ada di CSS frontend dan ketiganya
 * selalu tampil sebagai kotak polos di editor — terlihat seperti editor yang
 * rusak, padahal blocknya yang memang bukan bagian dari design system ini.
 */
export const layoutBlocks = reactbankBlocks

export * from './reactbank'
