import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'

/*
 * Tanpa nilai cadangan, dan itu disengaja.
 *
 * Versi sebelumnya memakai password sungguhan sebagai default. Itu nyaman
 * selama proyek tinggal di satu mesin, dan menjadi password yang terbit ke
 * publik begitu repositorinya di-push.
 */
const email = process.env.PAYLOAD_ADMIN_EMAIL
const password = process.env.PAYLOAD_ADMIN_PASSWORD

if (!email || !password) {
  console.error(
    'PAYLOAD_ADMIN_EMAIL dan PAYLOAD_ADMIN_PASSWORD wajib diisi. Lihat `.env.example`.',
  )
  process.exit(1)
}

const seed = async () => {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  })

  if (existing.totalDocs > 0) {
    payload.logger.info(`Admin user "${email}" already exists — skipping.`)
  } else {
    await payload.create({
      collection: 'users',
      data: { email, password },
    })
    payload.logger.info(`Admin user "${email}" created.`)
  }

  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
