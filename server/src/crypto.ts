import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

/** Normalize email before hashing/encrypting. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** HMAC-SHA256 lookup token for duplicate detection (not reversible to email). */
export function emailLookupHmac(email: string, hmacKey: Buffer): string {
  return createHmac('sha256', hmacKey)
    .update(normalizeEmail(email), 'utf8')
    .digest('hex')
}

/**
 * AES-256-GCM encrypt. Output format (base64):
 *   iv (12) || authTag (16) || ciphertext
 */
export function encryptEmail(email: string, encryptionKey: Buffer): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, encryptionKey, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })
  const plaintext = Buffer.from(normalizeEmail(email), 'utf8')
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

export function decryptEmail(
  payloadBase64: string,
  encryptionKey: Buffer,
): string {
  const payload = Buffer.from(payloadBase64, 'base64')
  if (payload.length <= IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Invalid ciphertext')
  }

  const iv = payload.subarray(0, IV_LENGTH)
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const ciphertext = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, encryptionKey, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

export function safeEqualHex(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8')
  const right = Buffer.from(b, 'utf8')
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}
