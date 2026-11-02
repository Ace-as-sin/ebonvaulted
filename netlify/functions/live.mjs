import { json } from './lib/http.mjs'

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 })
  }
  if (request.method !== 'GET') {
    return json({ ok: false, error: 'Method not allowed.' }, 405)
  }

  return json({
    ok: true,
    service: 'ebon-vaults-waitlist',
    checkedAt: new Date().toISOString(),
  })
}
