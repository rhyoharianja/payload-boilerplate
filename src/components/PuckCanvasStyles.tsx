'use client'

import React from 'react'

/**
 * Menyuntikkan stylesheet frontend ke dalam iframe canvas Puck — versi yang
 * sadar bahwa frontend berada di ORIGIN LAIN.
 *
 * Kenapa tidak memakai bawaan plugin: plugin membaca href stylesheet dengan
 * `getAttribute('href')`, yang mengembalikan nilai MENTAH dan relatif
 * (`/_next/static/css/app/layout.css`). Nilai itu lalu dipasang di iframe yang
 * base URL-nya adalah origin CMS, sehingga browser memintanya ke `:3001` dan
 * mendapat 404 — canvas tampil tanpa gaya sama sekali, sementara Live Preview
 * terlihat normal. Gejalanya menyesatkan karena tidak ada error yang jelas.
 *
 * Selama frontend satu origin dengan CMS, perilaku itu benar. Ia baru salah
 * ketika keduanya dipisah, dan itulah susunan yang dipakai proyek ini.
 *
 * Yang diubah di sini hanya satu hal: setiap href di-resolve terhadap origin
 * frontend sebelum dipasang.
 */

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3030'

/** Ubah href relatif menjadi absolut terhadap origin frontend. */
const absolutize = (href: string): null | string => {
  try {
    return new URL(href, FRONTEND_URL).toString()
  } catch {
    // href yang tidak bisa diurai dilewati, bukan menggagalkan yang lain.
    return null
  }
}

type OverrideProps = {
  children?: React.ReactNode
  document?: Document
}

export const PuckCanvasStyles: React.FC<OverrideProps> = ({ children, document: doc }) => {
  const [hrefs, setHrefs] = React.useState<string[]>([])
  const [inline, setInline] = React.useState<string[]>([])

  React.useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch(FRONTEND_URL, { credentials: 'include' })
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const parsed = new DOMParser().parseFromString(await res.text(), 'text/html')
        if (cancelled) {
          return
        }

        setHrefs(
          [...parsed.querySelectorAll('link[rel="stylesheet"]')]
            .map((link) => link.getAttribute('href'))
            .filter((href): href is string => Boolean(href))
            .map(absolutize)
            .filter((href): href is string => Boolean(href)),
        )
        setInline(
          [...parsed.querySelectorAll('style')]
            .map((el) => el.textContent ?? '')
            .filter(Boolean),
        )
      } catch (err) {
        // Gagal memuat CSS tidak boleh menggagalkan editor: urutan blok masih
        // bisa disusun walau tampilannya polos.
        console.warn(
          `[canvas] gagal memuat stylesheet frontend dari ${FRONTEND_URL}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        )
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    if (!doc) {
      return
    }
    const added: Element[] = []

    for (const href of hrefs) {
      if (doc.querySelector(`link[href="${href}"]`)) {
        continue
      }
      const link = doc.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      doc.head.appendChild(link)
      added.push(link)
    }

    for (const css of inline) {
      const style = doc.createElement('style')
      style.textContent = css
      doc.head.appendChild(style)
      added.push(style)
    }

    return () => {
      added.forEach((el) => el.remove())
    }
  }, [doc, hrefs, inline])

  return <React.Fragment>{children}</React.Fragment>
}

export default PuckCanvasStyles
