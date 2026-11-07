import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  checkWaitlistHealth,
  checkWaitlistLive,
  dryRunWaitlistSignup,
  getWaitlistLiveEndpoint,
} from './waitlistStatus'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
  vi.unstubAllEnvs()
})

describe('getWaitlistLiveEndpoint', () => {
  it('derives /live from a /health health endpoint', () => {
    vi.stubEnv('VITE_WAITLIST_HEALTH_ENDPOINT', 'https://example.test/health')
    vi.stubEnv('VITE_WAITLIST_LIVE_ENDPOINT', '')
    expect(getWaitlistLiveEndpoint()).toBe('https://example.test/live')
  })

  it('prefers an explicit live endpoint', () => {
    vi.stubEnv('VITE_WAITLIST_HEALTH_ENDPOINT', 'https://example.test/health')
    vi.stubEnv('VITE_WAITLIST_LIVE_ENDPOINT', 'https://example.test/ping')
    expect(getWaitlistLiveEndpoint()).toBe('https://example.test/ping')
  })
})

describe('checkWaitlistLive', () => {
  it('returns not_configured when no live URL can be resolved', async () => {
    vi.stubEnv('VITE_WAITLIST_HEALTH_ENDPOINT', '')
    vi.stubEnv('VITE_WAITLIST_LIVE_ENDPOINT', '')
    const result = await checkWaitlistLive()
    expect(result.ok).toBe(false)
    expect(result.code).toBe('not_configured')
  })

  it('reports up when /live returns ok', async () => {
    vi.stubEnv('VITE_WAITLIST_LIVE_ENDPOINT', 'https://example.test/live')
    globalThis.fetch = vi.fn(async () =>
      Response.json({ ok: true, checkedAt: '2026-01-01T00:00:00.000Z' }),
    ) as typeof fetch

    const result = await checkWaitlistLive()
    expect(result.ok).toBe(true)
    expect(result.code).toBe('ok')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://example.test/live',
      expect.objectContaining({ method: 'GET' }),
    )
  })
})

describe('checkWaitlistHealth', () => {
  it('returns not_configured when health endpoint is missing', async () => {
    vi.stubEnv('VITE_WAITLIST_HEALTH_ENDPOINT', '')
    const result = await checkWaitlistHealth('secret-token-value')
    expect(result.ok).toBe(false)
    expect(result.code).toBe('not_configured')
  })

  it('returns unauthorized for empty token when endpoint is set', async () => {
    vi.stubEnv('VITE_WAITLIST_HEALTH_ENDPOINT', 'https://example.test/health')
    const result = await checkWaitlistHealth('   ')
    expect(result.ok).toBe(false)
    expect(result.code).toBe('unauthorized')
  })

  it('parses a successful health payload', async () => {
    vi.stubEnv('VITE_WAITLIST_HEALTH_ENDPOINT', 'https://example.test/health')
    globalThis.fetch = vi.fn(async () =>
      Response.json({
        ok: true,
        uptimeSec: 12,
        signupCount: 3,
        lastSignupAt: '2026-01-01T00:00:00.000Z',
        dryRunSupported: true,
      }),
    ) as typeof fetch

    const result = await checkWaitlistHealth('secret-token-value')
    expect(result.ok).toBe(true)
    expect(result.code).toBe('ok')
    expect(result.data?.signupCount).toBe(3)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://example.test/health',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer secret-token-value',
        }),
      }),
    )
  })

  it('maps 401 to unauthorized', async () => {
    vi.stubEnv('VITE_WAITLIST_HEALTH_ENDPOINT', 'https://example.test/health')
    globalThis.fetch = vi.fn(async () =>
      Response.json({ ok: false, error: 'Unauthorized.' }, { status: 401 }),
    ) as typeof fetch

    const result = await checkWaitlistHealth('wrong')
    expect(result.ok).toBe(false)
    expect(result.code).toBe('unauthorized')
  })
})

describe('dryRunWaitlistSignup', () => {
  it('returns not_configured when waitlist endpoint is missing', async () => {
    vi.stubEnv('VITE_WAITLIST_ENDPOINT', '')
    const result = await dryRunWaitlistSignup('secret-token-value')
    expect(result.ok).toBe(false)
    expect(result.code).toBe('not_configured')
  })

  it('requires dryRun confirmation from the server', async () => {
    vi.stubEnv('VITE_WAITLIST_ENDPOINT', 'https://example.test/waitlist')
    globalThis.fetch = vi.fn(async () =>
      Response.json({ ok: true }),
    ) as typeof fetch

    const result = await dryRunWaitlistSignup('secret-token-value')
    expect(result.ok).toBe(false)
    expect(result.code).toBe('server')
  })

  it('passes when the server confirms dry-run', async () => {
    vi.stubEnv('VITE_WAITLIST_ENDPOINT', 'https://example.test/waitlist')
    globalThis.fetch = vi.fn(async () =>
      Response.json({
        ok: true,
        dryRun: true,
        validated: true,
        writable: true,
      }),
    ) as typeof fetch

    const result = await dryRunWaitlistSignup('secret-token-value')
    expect(result.ok).toBe(true)
    expect(result.dryRun).toBe(true)
    expect(result.validated).toBe(true)
    expect(result.writable).toBe(true)

    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0] ?? []
    expect(init?.method).toBe('POST')
    expect(init?.headers).toEqual(
      expect.objectContaining({
        Authorization: 'Bearer secret-token-value',
        'X-Waitlist-Dry-Run': 'true',
      }),
    )
  })
})
