import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { payAdminTheme } from 'payload-admin-theme'
import { payloadPuckAdvance } from 'payload-puck-advance'
import { payloadHrbac } from 'payload-hrbac'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Authors } from './collections/Authors'
import { Categories } from './collections/Categories'
import { CaseStudies } from './collections/CaseStudies'
import { Faqs } from './collections/Faqs'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { TeamMembers } from './collections/TeamMembers'
import { globals } from './globals'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Origin yang boleh memanggil API ini dari browser.
 *
 * Frontend berjalan di origin BERBEDA (`:3030`) dan mengambil konten lewat REST
 * API, jadi tanpa daftar ini browser memblokir setiap permintaannya. Origin
 * ditulis eksplisit, bukan `*`, karena `*` tidak sah untuk permintaan yang
 * membawa credential — dan preview draft memang membawa cookie.
 *
 * `csrf` memakai daftar yang sama: Payload menolak mutasi ber-cookie dari origin
 * yang tidak terdaftar, dan itu justru yang melindungi panel admin.
 */
const allowedOrigins = [
  process.env.FRONTEND_URL ?? 'http://localhost:3030',
  process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3001',
].filter(Boolean)

export default buildConfig({
  admin: {
    // Preview memuat frontend SUNGGUHAN dalam mode draft, bukan tiruan di dalam
    // admin. Canvas Puck menunjukkan susunan; halaman ini menunjukkan hasilnya.
    livePreview: {
      collections: ['pages'],
      url: ({ data }) =>
        `${process.env.FRONTEND_URL ?? 'http://localhost:3001'}/preview?slug=${
          (data as { slug?: string })?.slug ?? 'home'
        }`,
    },
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages, Posts, Categories, Authors, CaseStudies, TeamMembers, Faqs],
  globals,
  cors: allowedOrigins,
  csrf: allowedOrigins,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  // RBAC dinamis + berjenjang, sampai ke level field. Tanpa opsi, plugin
  // mengelola seluruh collection & global yang ada di config ini.
  plugins: [
    payloadHrbac(),
    // Tema admin: seluruh warna, bentuk, dan branding diatur dari global
    // "Tema Admin" di panel, dan berlaku langsung setelah disimpan.
    payAdminTheme({ defaults: { accent: '#0d9488', siteTitle: 'Payload Boilerplate' } }),
    // Atomic design system. Contract adalah sumber kebenaran; field Payload dan
    // config Puck DIHASILKAN darinya, jadi menambah section cukup satu tempat.
    /*
     * Penyunting Puck MENEMPEL pada collection `pages` yang didefinisikan aplikasi
     * ini. Plugin tidak membuat collection, tidak mendaftarkan block, dan tidak
     * membawa komponen — panel field Puck diturunkan dari definisi block Payload.
     */
    payloadPuckAdvance({
      collections: ['pages'],
      puckViewComponent: '@/components/PuckView#PuckView',
      revalidate: process.env.REVALIDATE_SECRET
        ? {
            secret: process.env.REVALIDATE_SECRET,
            url: `${process.env.FRONTEND_URL ?? 'http://localhost:3001'}/api/puck-revalidate`,
          }
        : false,
    }),
  ],
})
