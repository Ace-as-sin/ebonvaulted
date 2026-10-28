import { afterEach, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import type { DatabaseSync } from 'node:sqlite'
import type { AppConfig } from '../src/config.js'
import { countSignups, exportDecryptedRows } from '../src/db.js'
import { makeTestApp, validPayload } from './helpers.js'

describe('POST /api/waitlist', () => {
  let app: FastifyInstance
  let db: DatabaseSync
  let config: AppConfig

  afterEach(async () => {
    await app?.close()
    db?.close()
  })

  it('validates inputs and requires consent', async () => {
    ;({ app, db, config } = await makeTestApp())

    const missingConsent = await app.inject({
      method: 'POST',
      url: '/api/waitlist',
      headers: { origin: 'https://ebonvaults.com' },
      payload: { ...validPayload, consent: false },
    })
    expect(missingConsent.statusCode).toBe(400)
    expect(missingConsent.json().ok).toBe(false)
    expect(countSignups(db)).toBe(0)

    const badEmail = await app.inject({
      method: 'POST',
      url: '/api/waitlist',
      headers: { origin: 'https://ebonvaults.com' },
      payload: { ...validPayload, email: 'not-an-email' },
    })
    expect(badEmail.statusCode).toBe(400)
    void config
  })

  it('persists encrypted email and never stores plaintext', async () => {
    ;({ app, db, config } = await makeTestApp())

    const response = await app.inject({
      method: 'POST',
      url: '/api/waitlist',
      headers: { origin: 'http://localhost:5173' },
      payload: validPayload,
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({ ok: true })
    expect(countSignups(db)).toBe(1)

    const row = db.prepare('SELECT * FROM waitlist').get() as Record<
      string,
      unknown
    >
    expect(JSON.stringify(row)).not.toContain('person@example.com')
    expect(String(row.email_ciphertext)).not.toContain('person@example.com')

    const rows = exportDecryptedRows(db, config)
    expect(rows[0]?.email).toBe('person@example.com')
  })

  it('handles duplicates without revealing existence', async () => {
    ;({ app, db } = await makeTestApp())

    const first = await app.inject({
      method: 'POST',
      url: '/api/waitlist',
      headers: { origin: 'https://ebonvaults.com' },
      payload: validPayload,
    })
    const second = await app.inject({
      method: 'POST',
      url: '/api/waitlist',
      headers: { origin: 'https://ebonvaults.com' },
      payload: {
        ...validPayload,
        email: 'PERSON@example.com',
        plan: 'premium',
      },
    })

    expect(first.statusCode).toBe(201)
    expect(second.statusCode).toBe(201)
    expect(first.json()).toEqual(second.json())
    expect(countSignups(db)).toBe(1)
  })

  it('rejects oversized bodies', async () => {
    ;({ app, db } = await makeTestApp({ bodyLimitBytes: 200 }))

    const response = await app.inject({
      method: 'POST',
      url: '/api/waitlist',
      headers: { origin: 'https://ebonvaults.com' },
      payload: {
        ...validPayload,
        feedback: 'x'.repeat(5000),
      },
    })

    expect([400, 413]).toContain(response.statusCode)
    expect(response.json().ok).toBe(false)
  })

  it('returns generic error payload on validation failure', async () => {
    ;({ app, db } = await makeTestApp())

    const response = await app.inject({
      method: 'POST',
      url: '/api/waitlist',
      headers: { origin: 'https://ebonvaults.com' },
      payload: { ...validPayload, plan: 'enterprise' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({
      ok: false,
      error: 'Invalid request. Check your answers and try again.',
    })
  })
})
