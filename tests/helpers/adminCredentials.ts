/**
 * Kredensial admin untuk uji, dibaca dari lingkungan.
 *
 * TIDAK ada nilai cadangan. Sebelumnya password sungguhan ditulis sebagai
 * fallback di delapan berkas — nyaman selama repositori ini tinggal di satu
 * mesin, dan permanen begitu ia terbit ke GitHub. Nilai cadangan seperti itu
 * juga tidak pernah terasa salah: uji tetap hijau, jadi tidak ada yang
 * memeriksanya lagi.
 *
 * `playwright.config.ts` dan `vitest.setup.ts` sama-sama memuat `.env`, jadi
 * menjalankan uji secara lokal tidak butuh langkah tambahan — berkas itu sudah
 * di-ignore git.
 */

const required = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `${name} belum diset. Uji end-to-end memakai akun admin sungguhan; ` +
        'isi nilainya di `.env` (lihat `.env.example`) atau ekspor sebelum menjalankan uji.',
    )
  }
  return value
}

export const adminEmail = (): string => required('PAYLOAD_ADMIN_EMAIL')
export const adminPassword = (): string => required('PAYLOAD_ADMIN_PASSWORD')
