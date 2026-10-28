import { describe, expect, it } from 'vitest'
import { randomBytes } from 'node:crypto'
import {
  decryptEmail,
  emailLookupHmac,
  encryptEmail,
  normalizeEmail,
} from '../src/crypto.js'

describe('crypto', () => {
  const encryptionKey = randomBytes(32)
  const hmacKey = randomBytes(32)

  it('normalizes email casing and whitespace', () => {
    expect(normalizeEmail('  Alex@Example.COM ')).toBe('alex@example.com')
  })

  it('encrypts with unique nonces and decrypts', () => {
    const a = encryptEmail('user@example.com', encryptionKey)
    const b = encryptEmail('user@example.com', encryptionKey)
    expect(a).not.toEqual(b)
    expect(decryptEmail(a, encryptionKey)).toBe('user@example.com')
    expect(decryptEmail(b, encryptionKey)).toBe('user@example.com')
  })

  it('rejects tampered ciphertext', () => {
    const sealed = Buffer.from(
      encryptEmail('user@example.com', encryptionKey),
      'base64',
    )
    sealed[sealed.length - 1] ^= 0xff
    expect(() =>
      decryptEmail(sealed.toString('base64'), encryptionKey),
    ).toThrow()
  })

  it('produces stable HMAC for duplicate detection', () => {
    const left = emailLookupHmac('User@Example.com', hmacKey)
    const right = emailLookupHmac(' user@example.com ', hmacKey)
    expect(left).toEqual(right)
    expect(left).toHaveLength(64)
  })
})
