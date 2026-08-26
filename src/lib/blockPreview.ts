/**
 * Penyandian baris block untuk URL pratinjau frontend.
 *
 * Ini SALINAN yang disengaja dari `NEXT-REACTBANK/src/lib/blockPreview.ts`.
 *
 * Menghindarinya berarti CMS harus meng-import berkas dari repositori lain, dan
 * justru kopling itulah yang dibongkar — CMS kini hanya perlu tahu ALAMAT
 * frontend, bukan letaknya di disk. Yang diduplikasi bukan logika bisnis
 * melainkan FORMAT KABEL, dan seperti format kabel mana pun ia hanya boleh
 * berubah di kedua sisi sekaligus.
 *
 * Kalau formatnya berubah sepihak, gejalanya sunyi: pratinjau blok berhenti
 * muncul di canvas sementara halaman tayang tetap normal.
 */

/** Batas aman panjang query. Jauh di bawah batas header Node (16 kB). */
export const MAX_ENCODED_LENGTH = 8000

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const collect = async (stream: ReadableStream<Uint8Array>): Promise<Uint8Array> => {
  const chunks: Uint8Array[] = []
  const reader = stream.getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    chunks.push(value)
  }
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

/** Baris block → string aman-URL, dipadatkan lebih dulu. */
export const encodeBlockRow = async (row: unknown): Promise<string> => {
  const json = new TextEncoder().encode(JSON.stringify(row))
  const stream = new Blob([json as BlobPart]).stream().pipeThrough(new CompressionStream('deflate'))
  return toBase64Url(await collect(stream))
}
