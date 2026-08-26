import { adminEmail, adminPassword } from './adminCredentials'

/**
 * Menyiapkan pengguna uji lewat REST API, bukan lewat Payload Local API.
 *
 * Versi sebelumnya meng-import `src/payload.config.ts` langsung. Itu menarik
 * seluruh rantai plugin ke dalam proses Playwright, dan `payload-theme@0.9.1`
 * mengirim import ESM TANPA ekstensi berkas (`from './options'`) — sah bagi
 * bundler, tidak sah bagi Node. Akibatnya seluruh run Playwright mati saat
 * memuat berkas ini, sebelum satu pun test berjalan, dengan pesan yang menunjuk
 * ke dalam node_modules dan sama sekali tidak menyebut helper ini.
 *
 * Vitest punya jalan keluar (`server.deps.inline`); Playwright tidak. Jadi
 * helper ini memakai HTTP saja, sama seperti spec e2e lainnya — dan sekaligus
 * menguji jalur yang benar-benar dipakai admin.
 */

const BASE = process.env.CMS_URL ?? 'http://localhost:3001'
const ADMIN_EMAIL = adminEmail()
const ADMIN_PASSWORD = adminPassword()

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
}

/** Token admin untuk operasi yang butuh autentikasi. */
const login = async (): Promise<string> => {
  const res = await fetch(`${BASE}/api/users/login`, {
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!res.ok) {
    throw new Error(`Login admin gagal (${res.status}) saat menyiapkan pengguna uji`)
  }
  return ((await res.json()) as { token: string }).token
}

const deleteTestUser = async (token: string): Promise<void> => {
  const query = `where[email][equals]=${encodeURIComponent(testUser.email)}`
  const res = await fetch(`${BASE}/api/users?${query}`, {
    headers: { Authorization: `JWT ${token}` },
    method: 'DELETE',
  })
  // 404 berarti memang belum ada — itu bukan kegagalan.
  if (!res.ok && res.status !== 404) {
    throw new Error(`Gagal menghapus pengguna uji (${res.status})`)
  }
}

/**
 * Mencari id peran berdasarkan slug.
 *
 * Id-nya TIDAK dipatok di test: peran dibuat oleh seed plugin, dan urutannya
 * bisa berbeda di basis data yang baru.
 */
const roleId = async (token: string, slug: string): Promise<number | string> => {
  const res = await fetch(`${BASE}/api/roles?where[slug][equals]=${slug}&limit=1`, {
    headers: { Authorization: `JWT ${token}` },
  })
  const { docs } = (await res.json()) as { docs: { id: number | string }[] }
  if (!docs?.length) {
    throw new Error(`Peran "${slug}" tidak ada — seed peran belum berjalan?`)
  }
  return docs[0].id
}

/**
 * Membuat pengguna uji dari nol; sisa run sebelumnya dibuang dulu.
 *
 * Pengguna ini DIBERI peran super-admin. Tanpa peran, `payload-hrbac` menolaknya
 * masuk panel admin dan nav-nya kosong sama sekali — itu perilaku RBAC yang
 * benar, tapi gejalanya identik dengan admin yang rusak, dan test navigasi apa
 * pun akan gagal tanpa menyebut peran sedikit pun.
 */
export async function seedTestUser(): Promise<void> {
  const token = await login()
  await deleteTestUser(token)

  const res = await fetch(`${BASE}/api/users`, {
    body: JSON.stringify({ ...testUser, roles: [await roleId(token, 'super-admin')] }),
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!res.ok) {
    throw new Error(`Gagal membuat pengguna uji (${res.status}): ${await res.text()}`)
  }
}

/** Membersihkan pengguna uji setelah test selesai. */
export async function cleanupTestUser(): Promise<void> {
  await deleteTestUser(await login())
}
