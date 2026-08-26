import 'dotenv/config'
import { getPayload } from 'payload'
import { bootstrapRoles } from 'payload-hrbac'

import config from '../payload.config'

/**
 * Membuat peran bawaan dan menetapkan Super Admin.
 *
 * Wajib dijalankan sekali setelah memasang payload-hrbac. Selama collection `roles`
 * kosong, semua pengguna diperlakukan sebagai super admin; begitu peran pertama
 * dibuat mode itu mati, dan pengguna yang belum ditautkan ke peran akan
 * kehilangan akses ke /admin.
 */
const main = async () => {
  const payload = await getPayload({ config })

  await bootstrapRoles(payload, {
    assignSuperAdminTo: process.env.PAYLOAD_ADMIN_EMAIL
      ? [process.env.PAYLOAD_ADMIN_EMAIL]
      : 'auto',
    roles: [
      {
        name: 'Super Admin',
        canAccessAdmin: true,
        description: 'Akses penuh ke seluruh data dan pengaturan, termasuk mengelola peran.',
        isSuperAdmin: true,
        slug: 'super-admin',
      },
      {
        name: 'Viewer',
        canAccessAdmin: true,
        collectionPermissions: [{ collection: 'media', read: true }],
        description: 'Hanya membaca.',
        slug: 'viewer',
      },
      {
        // Contoh pewarisan: Editor otomatis dapat semua izin Viewer, jadi
        // barisnya cukup berisi tambahannya saja.
        name: 'Editor',
        canAccessAdmin: true,
        collectionPermissions: [{ collection: 'media', create: true, update: true }],
        description: 'Mewarisi Viewer, ditambah membuat & mengubah media.',
        parent: 'viewer',
        slug: 'editor',
      },
    ],
  })

  process.exit(0)
}

main().catch((err) => {
  console.error('[rbac:init] gagal:', err)
  process.exit(1)
})
