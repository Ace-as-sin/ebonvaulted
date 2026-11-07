export function json(data, status = 200, extraHeaders = {}) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  })
}

export function getBearerToken(request) {
  const header = request.headers.get('authorization') ?? ''
  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null
  return token.trim()
}

export function requireStatusToken(request) {
  const expected = (process.env.WAITLIST_STATUS_TOKEN ?? '').trim()
  if (!expected || expected.length < 16) return false
  const token = getBearerToken(request)
  return Boolean(token && token === expected)
}

export function isDryRun(request) {
  const header = request.headers.get('x-waitlist-dry-run')
  return header === 'true' || header === '1'
}
