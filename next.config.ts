import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    /*
     * Root adalah folder proyek ini, bukan induknya.
     *
     * Dulu ia naik satu level karena dua hal: plugin yang di-link dari folder
     * sibling, dan komponen frontend yang di-import lewat alias `@fe/*`. Plugin
     * kini dipasang dari npm, dan komponen frontend diminta lewat HTTP — jadi
     * tidak ada lagi yang perlu di-resolve di luar folder ini.
     */
    root: dirname,
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
