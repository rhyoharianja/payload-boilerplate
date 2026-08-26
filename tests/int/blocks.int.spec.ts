import { describe, expect, it } from 'vitest'

import { blockComponents } from '@/blocks/render'
import { layoutBlocks } from '@/blocks'

/**
 * Definisi block Payload dan peta komponen frontend adalah DUA daftar yang harus
 * cocok, dan tidak ada apa pun saat runtime yang memaksanya.
 *
 * Kalau menyimpang, gejalanya sunyi: blok yang punya definisi tapi tanpa komponen
 * hanya muncul sebagai kotak kosong di canvas Puck, dan komponen tanpa definisi
 * tidak pernah bisa dipasang editor. Keduanya terbaca sebagai "editornya rusak",
 * bukan sebagai daftar yang lupa diperbarui.
 *
 * Uji ini yang menangkapnya, dan ia berjalan tanpa browser maupun basis data.
 */
describe('kesejajaran definisi block dan komponen render', () => {
  const blockSlugs = layoutBlocks.map((block) => block.slug).sort()
  const componentSlugs = Object.keys(blockComponents).sort()

  it('setiap block Payload punya komponen render', () => {
    const missing = blockSlugs.filter((slug) => !(slug in blockComponents))
    expect(missing, 'block tanpa komponen akan tampil kosong di canvas Puck').toEqual([])
  })

  it('setiap komponen render punya definisi block', () => {
    const orphan = componentSlugs.filter((slug) => !blockSlugs.includes(slug))
    expect(orphan, 'komponen tanpa definisi block tidak pernah bisa dipasang editor').toEqual([])
  })

  it('tidak ada slug block yang ganda', () => {
    const seen = new Set<string>()
    const duplicates = blockSlugs.filter((slug) => !seen.add(slug))
    expect(duplicates, 'slug ganda membuat definisi yang belakangan menimpa yang awal').toEqual([])
  })

  it('setiap field select punya opsi', () => {
    /*
     * Postgres menerjemahkan `select` menjadi enum, dan enum tanpa nilai adalah
     * kesalahan sintaks. Sekali skema itu ter-push, `dev` gagal terus di titik
     * yang sama sampai enum-nya dibuang manual — mahal untuk kesalahan sekecil
     * lupa mengisi `options`.
     */
    const emptySelects: string[] = []

    const walk = (fields: unknown[], path: string) => {
      for (const field of fields as Record<string, unknown>[]) {
        const name = typeof field.name === 'string' ? field.name : '(tanpa nama)'
        const here = `${path}.${name}`
        if (field.type === 'select' && !(field.options as unknown[])?.length) {
          emptySelects.push(here)
        }
        if (Array.isArray(field.fields)) {
          walk(field.fields, here)
        }
      }
    }

    for (const block of layoutBlocks) {
      walk(block.fields, block.slug)
    }

    expect(emptySelects).toEqual([])
  })
})
