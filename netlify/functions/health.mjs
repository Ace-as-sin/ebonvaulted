import { json, requireStatusToken } from './lib/http.mjs'
import { getStats } from './lib/store.mjs'

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 })
  }
  if (request.method !== 'GET') {
    return json({ ok: false, error: 'Method not allowed.' }, 405)
  }
  if (!requireStatusToken(request)) {
    return json({ ok: false, error: 'Unauthorized.' }, 401)
  }

  try {
    const stats = await getStats()
    return json({
      ok: true,
      uptimeSec: 0,
      signupCount: stats.signupCount,
      lastSignupAt: stats.lastSignupAt,
      dryRunSupported: true,
      dataFileBytes: stats.dataFileBytes,
      checkedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[health]', err)
    return json({ ok: false, error: 'Internal server error.' }, 500)
  }
}
