'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/**
 * Live Preview varian SERVER-SIDE: menyegar saat dokumen disimpan, bukan saat
 * mengetik.
 *
 * Varian client-side mendorong form state lewat postMessage setiap ketikan. Untuk
 * frontend di service terpisah itu membuang bandwidth, dan hasilnya tidak melewati
 * pipeline render sebenarnya sehingga justru kurang akurat.
 */
export const RefreshOnSave = () => {
  const router = useRouter()
  return (
    <RefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001'}
    />
  )
}
