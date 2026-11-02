export interface WaitlistHealthResponse {
  ok: boolean
  uptimeSec?: number
  signupCount?: number
  lastSignupAt?: string | null
  dryRunSupported?: boolean
  dataFileBytes?: number
  checkedAt?: string
  error?: string
}

export type WaitlistStatusCode =
  | 'ok'
  | 'not_configured'
  | 'unauthorized'
  | 'network'
  | 'cors'
  | 'server'
  | 'validation'

export interface WaitlistHealthResult {
  ok: boolean
  code: WaitlistStatusCode
  latencyMs: number
  error?: string
  data?: WaitlistHealthResponse
}

export interface WaitlistDryRunResult {
  ok: boolean
  code: WaitlistStatusCode
  latencyMs: number
  error?: string
  dryRun?: boolean
  validated?: boolean
  writable?: boolean
}

function trimEnv(value: string | undefined): string | undefined {
  if (!value || !value.trim()) return undefined
  return value.trim()
}

export function getWaitlistHealthEndpoint(): string | undefined {
  return trimEnv(import.meta.env.VITE_WAITLIST_HEALTH_ENDPOINT as string | undefined)
}

export function getWaitlistEndpointForStatus(): string | undefined {
  return trimEnv(import.meta.env.VITE_WAITLIST_ENDPOINT as string | undefined)
}

/**
 * Public liveness URL for automatic uptime checks (no access key).
 * Uses VITE_WAITLIST_LIVE_ENDPOINT when set; otherwise derives from
 * VITE_WAITLIST_HEALTH_ENDPOINT by replacing a trailing `/health` with `/live`.
 */
export function getWaitlistLiveEndpoint(): string | undefined {
  const explicit = trimEnv(
    import.meta.env.VITE_WAITLIST_LIVE_ENDPOINT as string | undefined,
  )
  if (explicit) return explicit

  const health = getWaitlistHealthEndpoint()
  if (!health) return undefined
  if (health.endsWith('/health')) {
    return `${health.slice(0, -'/health'.length)}/live`
  }
  return undefined
}

export interface WaitlistLiveResult {
  ok: boolean
  code: WaitlistStatusCode
  latencyMs: number
  error?: string
  checkedAt?: string
}

export async function checkWaitlistLive(): Promise<WaitlistLiveResult> {
  const endpoint = getWaitlistLiveEndpoint()
  if (!endpoint) {
    return {
      ok: false,
      code: 'not_configured',
      latencyMs: 0,
      error:
        'Live check URL is not configured. Set VITE_WAITLIST_LIVE_ENDPOINT or VITE_WAITLIST_HEALTH_ENDPOINT ending in /health.',
    }
  }

  const started = performance.now()

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    const latencyMs = Math.round(performance.now() - started)
    let data: { ok?: boolean; checkedAt?: string; error?: string } = {}
    try {
      data = (await response.json()) as typeof data
    } catch {
      data = {}
    }

    if (!response.ok || data.ok !== true) {
      return {
        ok: false,
        code: classifyHttpError(response.status),
        latencyMs,
        error:
          data.error ??
          `API live check failed (HTTP ${response.status}).`,
        checkedAt: data.checkedAt,
      }
    }

    return {
      ok: true,
      code: 'ok',
      latencyMs,
      checkedAt: data.checkedAt ?? new Date().toISOString(),
    }
  } catch (err) {
    const classified = classifyFetchFailure(err)
    return {
      ok: false,
      code: classified.code,
      latencyMs: Math.round(performance.now() - started),
      error: classified.error,
    }
  }
}

function classifyHttpError(status: number): WaitlistStatusCode {
  if (status === 401 || status === 403) return 'unauthorized'
  if (status === 400) return 'validation'
  return 'server'
}

function classifyFetchFailure(err: unknown): {
  code: WaitlistStatusCode
  error: string
} {
  const message = err instanceof Error ? err.message : String(err)
  // Browsers often surface CORS/network failures as TypeError: Failed to fetch
  if (/failed to fetch|networkerror|load failed|cors/i.test(message)) {
    return {
      code: 'cors',
      error:
        'Could not reach the waitlist server (network or CORS). Confirm the desktop server is running and CORS_ORIGIN includes this site.',
    }
  }
  return {
    code: 'network',
    error: 'Network error while contacting the waitlist server.',
  }
}

export async function checkWaitlistHealth(
  token: string,
): Promise<WaitlistHealthResult> {
  const endpoint = getWaitlistHealthEndpoint()
  if (!endpoint) {
    return {
      ok: false,
      code: 'not_configured',
      latencyMs: 0,
      error:
        'VITE_WAITLIST_HEALTH_ENDPOINT is not configured. Set it to your desktop server /health URL.',
    }
  }

  if (!token.trim()) {
    return {
      ok: false,
      code: 'unauthorized',
      latencyMs: 0,
      error: 'Access key is required.',
    }
  }

  const started = performance.now()

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token.trim()}`,
      },
      cache: 'no-store',
    })

    const latencyMs = Math.round(performance.now() - started)
    let data: WaitlistHealthResponse | undefined
    try {
      data = (await response.json()) as WaitlistHealthResponse
    } catch {
      data = undefined
    }

    if (!response.ok) {
      return {
        ok: false,
        code: classifyHttpError(response.status),
        latencyMs,
        error:
          data?.error ??
          (response.status === 401
            ? 'Access key was rejected by the server.'
            : `Health check failed (HTTP ${response.status}).`),
        data,
      }
    }

    if (!data?.ok) {
      return {
        ok: false,
        code: 'server',
        latencyMs,
        error: data?.error ?? 'Health endpoint returned an unsuccessful payload.',
        data,
      }
    }

    return { ok: true, code: 'ok', latencyMs, data }
  } catch (err) {
    const classified = classifyFetchFailure(err)
    return {
      ok: false,
      code: classified.code,
      latencyMs: Math.round(performance.now() - started),
      error: classified.error,
    }
  }
}

const DRY_RUN_EMAIL = 'status-check+dry-run@ebonvaults.invalid'

export async function dryRunWaitlistSignup(
  token: string,
): Promise<WaitlistDryRunResult> {
  const endpoint = getWaitlistEndpointForStatus()
  if (!endpoint) {
    return {
      ok: false,
      code: 'not_configured',
      latencyMs: 0,
      error:
        'VITE_WAITLIST_ENDPOINT is not configured. Set it to your desktop server waitlist POST URL.',
    }
  }

  if (!token.trim()) {
    return {
      ok: false,
      code: 'unauthorized',
      latencyMs: 0,
      error: 'Access key is required.',
    }
  }

  const started = performance.now()
  const payload = {
    email: DRY_RUN_EMAIL,
    plan: 'plus' as const,
    intendedUse: 'other' as const,
    feedback: 'Ebon Vaults /server-status dry-run — do not persist.',
    source:
      typeof window !== 'undefined'
        ? `${window.location.origin}/server-status`
        : undefined,
    submittedAt: new Date().toISOString(),
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token.trim()}`,
        'X-Waitlist-Dry-Run': 'true',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const latencyMs = Math.round(performance.now() - started)
    let data: {
      ok?: boolean
      dryRun?: boolean
      validated?: boolean
      writable?: boolean
      error?: string
    } = {}

    try {
      data = (await response.json()) as typeof data
    } catch {
      data = {}
    }

    if (!response.ok) {
      return {
        ok: false,
        code: classifyHttpError(response.status),
        latencyMs,
        error:
          data.error ??
          (response.status === 401
            ? 'Access key was rejected for dry-run.'
            : `Dry-run signup failed (HTTP ${response.status}).`),
      }
    }

    if (!data.ok || data.dryRun !== true) {
      return {
        ok: false,
        code: 'server',
        latencyMs,
        error:
          data.error ??
          'Server responded without confirming dryRun: true. Real signup may have been attempted — verify server support.',
      }
    }

    return {
      ok: true,
      code: 'ok',
      latencyMs,
      dryRun: true,
      validated: data.validated === true,
      writable: data.writable === true,
    }
  } catch (err) {
    const classified = classifyFetchFailure(err)
    return {
      ok: false,
      code: classified.code,
      latencyMs: Math.round(performance.now() - started),
      error: classified.error,
    }
  }
}
