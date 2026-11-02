import { timingSafeEqual } from 'node:crypto'

/**
 * Constant-time Bearer token comparison.
 * Returns false for missing/mismatched tokens without leaking length via timing
 * of the equality check when both sides are Buffers of equal length.
 */
export function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null
  }
  const match = /^Bearer\s+(.+)$/i.exec(authorizationHeader.trim())
  if (!match) return null
  const token = match[1].trim()
  return token.length > 0 ? token : null
}

export function tokensEqual(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string') {
    return false
  }
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) {
    // Still perform a compare against `b` to reduce trivial timing oracles on length.
    timingSafeEqual(b, b)
    return false
  }
  return timingSafeEqual(a, b)
}

export function requireStatusToken(req, expectedToken) {
  const provided = extractBearerToken(req.headers.authorization)
  return tokensEqual(provided, expectedToken)
}
