import type { Browser, BrowserContext } from '@playwright/test'

/**
 * Membuat context yang sudah terautentikasi lewat API, bukan lewat form login.
 *
 * Login lewat UI berulang kali membuat suite ini rapuh: setiap kali form diisi
 * sebelum halaman selesai hidrasi, klik-nya tidak berefek dan test berikutnya
 * mendarat di halaman login — gejalanya terlihat seperti flake acak, padahal
 * penyebabnya urutan. Payload 3.88 juga membuat sesi baru (`sid`) setiap login,
 * jadi mengulanginya di setiap spec dan setiap retry hanya menumpuk sesi tanpa
 * manfaat.
 *
 * Satu POST ke `/api/users/login` menghasilkan token yang sama sahnya, dan
 * cookie-nya disuntik langsung ke context.
 */
/**
 * Token di-cache per proses worker, dan itu bukan optimasi — ia memperbaiki bug.
 *
 * Dua login berurutan untuk user yang sama membuat token KEDUA ditolak: Payload
 * 3.88 menyimpan daftar sesi di dokumen user, dan dua penulisan yang berdekatan
 * saling menimpa sehingga sesi yang baru hilang. Gejalanya "flaky" — spec pertama
 * lolos, spec kedua mendarat di halaman login.
 *
 * Satu login per worker menghilangkan race-nya sekaligus mempercepat suite.
 */
let cachedToken: null | Promise<string> = null

const loginOnce = (base: string): Promise<string> => {
  cachedToken ??= (async () => {
    const res = await fetch(`${base}/api/users/login`, {
      body: JSON.stringify({
        email: process.env.PAYLOAD_ADMIN_EMAIL,
        password: process.env.PAYLOAD_ADMIN_PASSWORD,
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
    if (!res.ok) {
      throw new Error(`Login admin gagal: HTTP ${res.status}`)
    }
    const { token } = (await res.json()) as { token?: string }
    if (!token) {
      throw new Error('Login admin tidak mengembalikan token')
    }

    // Sesi disimpan asinkron; token dipakai hanya setelah benar-benar diterima.
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const me = await fetch(`${base}/api/users/me`, {
        headers: { authorization: `JWT ${token}` },
      })
      if (me.ok && (((await me.json()) as { user?: unknown }).user ?? null)) {
        return token
      }
      await new Promise((r) => setTimeout(r, 500))
    }
    throw new Error('Token admin tidak pernah menjadi sah — sesi tidak tersimpan?')
  })()

  return cachedToken
}

export const createAdminContext = async (
  browser: Browser,
  base: string,
): Promise<BrowserContext> => {
  const token = await loginOnce(base)

  const context = await browser.newContext()
  await context.addCookies([{ name: 'payload-token', url: base, value: token }])
  return context
}
