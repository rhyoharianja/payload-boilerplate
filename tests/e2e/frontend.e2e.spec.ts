import { expect, test } from '@playwright/test'

/**
 * Route frontend BAWAAN aplikasi CMS ini (bukan NEXT-REACTBANK).
 *
 * Yang diuji: halaman `/` benar-benar mengambil dokumen `home` dari Payload dan
 * merendernya lewat peta block yang sama dengan canvas Puck.
 *
 * Versi template sebelumnya mencari teks "Welcome to your new project." — teks
 * halaman contoh yang sudah lama diganti oleh route berbasis dokumen. Test itu
 * terus lulus selama halaman contohnya masih ada, lalu gagal karena alasan yang
 * tidak ada hubungannya dengan apa pun yang sedang dikerjakan.
 *
 * Catatan arsitektur: sejak frontend dipisah ke origin lain, route ini menjadi
 * frontend KEDUA yang merender dokumen yang sama. Ia dipertahankan sebagai jalur
 * cadangan, dan uji ini menjaga agar keduanya tidak diam-diam menyimpang.
 */

const BASE = process.env.CMS_URL ?? 'http://localhost:3001'

test.describe('Route frontend bawaan CMS', () => {
  test('halaman utama merender blocks dokumen `home`', async ({ page, request }) => {
    // Yang diharapkan diambil dari API, bukan ditulis tetap di test. Isi halaman
    // `home` adalah data yang bisa disunting siapa pun — mematoknya di sini
    // membuat test gagal setiap kali ada yang menyunting konten.
    const res = await request.get(`${BASE}/api/pages?where[slug][equals]=home&limit=1`)
    expect(res.ok(), 'dokumen `home` harus bisa diambil').toBeTruthy()

    const { docs } = (await res.json()) as {
      docs: { layout?: { blockType?: string; title?: string }[] }[]
    }
    const layout = docs[0]?.layout ?? []
    expect(layout.length, 'dokumen `home` harus punya blocks untuk diuji').toBeGreaterThan(0)

    const heading = layout.find((block) => block.title)?.title
    expect(heading, 'setidaknya satu block harus punya judul').toBeTruthy()

    await page.goto(BASE)
    await expect(page.getByText(heading!).first()).toBeVisible()
  })
})
