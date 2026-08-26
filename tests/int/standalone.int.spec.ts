import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Proyek ini harus bisa berdiri sendiri.
 *
 * Sebelumnya ia meng-import komponen dan data dari folder frontend di sebelahnya
 * lewat alias `@fe/*`. Di mesin pengembang itu tidak terasa; di repositori hasil
 * clone, `pnpm dev` gagal saat resolusi import — sebelum satu baris kode pun
 * berjalan.
 *
 * Kopling seperti itu mudah kembali tanpa disadari: satu import yang praktis,
 * dan semuanya tetap hijau secara lokal. Uji ini yang menangkapnya, dan ia tidak
 * butuh basis data maupun jaringan.
 */

const ROOTS = ['src', 'tests']

const walk = (dir: string): string[] => {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      out.push(...walk(path))
    } else if (/\.tsx?$/.test(entry)) {
      out.push(path)
    }
  }
  return out
}

describe('kemandirian repositori', () => {
  const files = ROOTS.flatMap((root) => walk(root))

  it('tidak ada berkas yang meng-import lintas folder', () => {
    const offenders = files.filter((file) => {
      const source = readFileSync(file, 'utf8')
      // Pola import/export saja — penyebutan di komentar tidak menciptakan
      // ketergantungan apa pun.
      return /(?:from|import)\s*\(?\s*['"](?:@fe\/|\.\.\/\.\.\/\.\.\/NEXT-)/.test(source)
    })

    expect(offenders, 'berkas ini menarik kode dari luar repositori').toEqual([])
  })

  it('tsconfig tidak lagi memetakan alias ke folder tetangga', () => {
    const tsconfig = readFileSync('tsconfig.json', 'utf8')
    expect(tsconfig).not.toContain('NEXT-REACTBANK')
  })
})
