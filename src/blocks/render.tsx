'use client'

import React from 'react'

import { layoutBlocks } from '@/blocks'
import { encodeBlockRow, MAX_ENCODED_LENGTH } from '@/lib/blockPreview'

/**
 * Peta render untuk canvas Puck — LEWAT URL, bukan lewat import.
 *
 * Sebelumnya berkas ini meng-import komponen section dari `../NEXT-REACTBANK`
 * lewat alias lintas folder. Itu membuat canvas jujur, tapi juga membuat CMS
 * tidak bisa berdiri sebagai repositori sendiri: di-clone tanpa folder frontend
 * di sebelahnya, ia gagal saat resolusi import.
 *
 * Sekarang setiap blok dirender dengan MEMINTANYA ke frontend. Satu-satunya yang
 * perlu diketahui CMS adalah alamatnya.
 *
 * Yang hilang, dan tidak bisa tidak: HIDRASI. Markup yang datang bersifat statis,
 * jadi slider kalkulator dan formulir tidak bereaksi di canvas. Di halaman tayang
 * keduanya tetap hidup — yang diam hanya pratinjaunya. Justru itu yang membuat
 * canvas tetap bisa dipakai: iframe atau markup interaktif akan menangkap
 * pointer, dan menyeret blok di Puck jadi tidak mungkin.
 */

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3030'

/** Props yang milik Puck, bukan milik block — tidak ikut dikirim. */
const INTERNAL = new Set(['editMode', 'id', 'puck', 'renderSlot'])

const toRow = (props: Record<string, unknown>, blockType: string): Record<string, unknown> => {
  const row: Record<string, unknown> = { blockType }
  for (const [key, value] of Object.entries(props)) {
    if (!INTERNAL.has(key) && typeof value !== 'function') {
      row[key] = value
    }
  }
  return row
}

type State = { html: string; status: 'error' | 'loading' | 'ready'; message?: string }

const Notice = ({ children, tone }: { children: React.ReactNode; tone: 'error' | 'muted' }) => (
  <div
    style={{
      background: tone === 'error' ? '#fef2f2' : '#f6f6f6',
      border: `1px dashed ${tone === 'error' ? '#dc2626' : '#c9c9c9'}`,
      borderRadius: 6,
      color: tone === 'error' ? '#991b1b' : '#666',
      fontSize: 13,
      padding: '1.5rem',
      textAlign: 'center',
    }}
  >
    {children}
  </div>
)

const RemoteBlock: React.FC<{ blockType: string; props: Record<string, unknown> }> = ({
  blockType,
  props,
}) => {
  const [state, setState] = React.useState<State>({ html: '', status: 'loading' })

  // Baris diserialkan menjadi kunci supaya efek hanya berjalan ulang saat isinya
  // benar-benar berubah — `props` adalah objek baru pada setiap render Puck.
  const rowKey = JSON.stringify(toRow(props, blockType))

  React.useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const encoded = await encodeBlockRow(JSON.parse(rowKey) as unknown)
        if (encoded.length > MAX_ENCODED_LENGTH) {
          setState({
            html: '',
            message: 'Isi blok terlalu besar untuk dipratinjau. Halaman tayang tidak terpengaruh.',
            status: 'error',
          })
          return
        }

        const res = await fetch(`${FRONTEND_URL}/block-preview?b=${encoded}`)
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const parsed = new DOMParser().parseFromString(await res.text(), 'text/html')
        const container = parsed.querySelector('[data-block-preview]')
        if (cancelled) {
          return
        }
        setState({ html: container?.innerHTML ?? '', status: 'ready' })
      } catch (error) {
        if (cancelled) {
          return
        }
        /*
         * Gagal memuat satu blok TIDAK boleh menjatuhkan canvas: penyunting
         * masih bisa menyusun urutan walau satu pratinjau kosong, dan frontend
         * yang sedang mati adalah kondisi yang wajar saat pengembangan.
         */
        setState({
          html: '',
          message: error instanceof Error ? error.message : String(error),
          status: 'error',
        })
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [rowKey])

  if (state.status === 'loading') {
    return <Notice tone="muted">Memuat pratinjau {blockType}…</Notice>
  }

  if (state.status === 'error') {
    return (
      <Notice tone="error">
        Pratinjau &ldquo;{blockType}&rdquo; gagal dimuat dari {FRONTEND_URL}
        {state.message ? ` — ${state.message}` : null}
      </Notice>
    )
  }

  // Blok yang dikenal Payload tapi belum punya komponen di frontend menghasilkan
  // markup kosong. Ruang kosong tanpa keterangan terbaca seperti canvas rusak.
  if (!state.html.trim()) {
    return <Notice tone="muted">Frontend tidak punya komponen untuk &ldquo;{blockType}&rdquo;.</Notice>
  }

  return <div dangerouslySetInnerHTML={{ __html: state.html }} />
}

export type BlockComponent = (props: Record<string, unknown>) => React.ReactNode

/**
 * Satu entri per block yang terdaftar di Payload.
 *
 * Diturunkan dari `layoutBlocks`, sumber yang sama dengan field `layout`, jadi
 * tidak ada daftar kedua yang bisa menyimpang.
 */
export const blockComponents: Record<string, BlockComponent> = Object.fromEntries(
  layoutBlocks.map((block) => [
    block.slug,
    (props: Record<string, unknown>) => <RemoteBlock blockType={block.slug} props={props} />,
  ]),
)
