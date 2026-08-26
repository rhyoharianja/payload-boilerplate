import { createRevalidateRoute } from 'payload-puck-advance/next'

/** Dipanggil hook `afterChange` Payload saat halaman dipublish. */
export const POST = createRevalidateRoute({ secret: process.env.REVALIDATE_SECRET })
