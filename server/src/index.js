import { createServer } from 'node:http'
import { requireStatusToken } from './auth.js'
import { getConfig, loadEnvFile } from './env.js'
import { clientIp, createRateLimiter } from './rateLimit.js'
import { createStore } from './store.js'
import { validateWaitlistPayload } from './validate.js'

loadEnvFile()

const config = getConfig()
const store = createStore(config.dataDir)
const startedAt = Date.now()
const rateLimit = createRateLimiter({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
})

function sendJson(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
    ...extraHeaders,
  })
  res.end(payload)
}

function applyCors(req, res) {
  const origin = req.headers.origin
  if (origin && config.corsOrigin.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Accept, Authorization, X-Waitlist-Dry-Run',
    )
    res.setHeader('Access-Control-Max-Age', '86400')
    return true
  }
  // Non-browser / same-origin style requests without Origin are allowed through
  // (e.g. curl health checks). Browser requests always send Origin.
  if (!origin) return true
  return false
}

function readBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0

    req.on('data', (chunk) => {
      size += chunk.length
      if (size > maxBytes) {
        reject(Object.assign(new Error('Payload too large.'), { code: 413 }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })

    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'))
    })

    req.on('error', reject)
  })
}

function isDryRun(req) {
  const header = req.headers['x-waitlist-dry-run']
  return header === 'true' || header === '1'
}

/** Public liveness probe — no auth, no PII. Used by /server-status auto-checks. */
async function handleLive(_req, res) {
  sendJson(res, 200, {
    ok: true,
    service: 'ebon-vaults-waitlist',
    checkedAt: new Date().toISOString(),
  })
}

async function handleHealth(req, res) {
  if (!requireStatusToken(req, config.token)) {
    sendJson(res, 401, { ok: false, error: 'Unauthorized.' })
    return
  }

  const stats = store.getStats()
  sendJson(res, 200, {
    ok: true,
    uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    signupCount: stats.signupCount,
    lastSignupAt: stats.lastSignupAt,
    dryRunSupported: true,
    dataFileBytes: stats.dataFileBytes,
    checkedAt: new Date().toISOString(),
  })
}

async function handleWaitlist(req, res) {
  const dryRun = isDryRun(req)

  if (dryRun && !requireStatusToken(req, config.token)) {
    sendJson(res, 401, { ok: false, error: 'Unauthorized dry-run.' })
    return
  }

  let raw
  try {
    raw = await readBody(req, config.maxBodyBytes)
  } catch (err) {
    if (err?.code === 413) {
      sendJson(res, 413, { ok: false, error: 'Payload too large.' })
      return
    }
    sendJson(res, 400, { ok: false, error: 'Could not read request body.' })
    return
  }

  let parsed
  try {
    parsed = raw ? JSON.parse(raw) : null
  } catch {
    sendJson(res, 400, { ok: false, error: 'Invalid JSON body.' })
    return
  }

  const validated = validateWaitlistPayload(parsed)
  if (!validated.ok) {
    sendJson(res, 400, { ok: false, error: validated.error })
    return
  }

  if (dryRun) {
    try {
      store.assertWritable()
    } catch {
      sendJson(res, 500, {
        ok: false,
        error: 'Data directory is not writable.',
      })
      return
    }

    sendJson(res, 200, {
      ok: true,
      dryRun: true,
      validated: true,
      writable: true,
      checkedAt: new Date().toISOString(),
    })
    return
  }

  try {
    store.appendSignup(validated.value)
  } catch {
    sendJson(res, 500, {
      ok: false,
      error: 'Failed to persist signup.',
    })
    return
  }

  sendJson(res, 200, { ok: true })
}

const server = createServer(async (req, res) => {
  try {
    if (!applyCors(req, res)) {
      sendJson(res, 403, { ok: false, error: 'Origin not allowed.' })
      return
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const ip = clientIp(req)
    const limit = rateLimit(`${ip}:${req.method}:${req.url?.split('?')[0]}`)
    if (!limit.allowed) {
      sendJson(
        res,
        429,
        { ok: false, error: 'Too many requests. Try again shortly.' },
        { 'Retry-After': String(limit.retryAfterSec ?? 60) },
      )
      return
    }

    const path = (req.url ?? '/').split('?')[0]

    if (req.method === 'GET' && path === '/live') {
      await handleLive(req, res)
      return
    }

    if (req.method === 'GET' && path === '/health') {
      await handleHealth(req, res)
      return
    }

    if (req.method === 'POST' && (path === '/waitlist' || path === '/')) {
      await handleWaitlist(req, res)
      return
    }

    sendJson(res, 404, { ok: false, error: 'Not found.' })
  } catch (err) {
    console.error('[waitlist-server] unhandled error', err)
    if (!res.headersSent) {
      sendJson(res, 500, { ok: false, error: 'Internal server error.' })
    }
  }
})

server.listen(config.port, config.host, () => {
  console.log(
    `[waitlist-server] listening on http://${config.host}:${config.port}`,
  )
  console.log(`[waitlist-server] data dir: ${config.dataDir}`)
  console.log(
    `[waitlist-server] CORS origins: ${config.corsOrigin.join(', ')}`,
  )
  console.log(
    '[waitlist-server] POST /waitlist  GET /live  GET /health (token required)',
  )
})
