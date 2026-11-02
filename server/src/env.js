import { existsSync, readFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SERVER_ROOT = resolve(__dirname, '..')

/** Minimal .env loader (no dependency). Does not override existing process.env. */
export function loadEnvFile(filePath = join(SERVER_ROOT, '.env')) {
  if (!existsSync(filePath)) return

  const text = readFileSync(filePath, 'utf8')
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

export function getConfig() {
  const token = (process.env.WAITLIST_STATUS_TOKEN ?? '').trim()
  if (!token || token.length < 16) {
    throw new Error(
      'WAITLIST_STATUS_TOKEN must be set to a random secret of at least 16 characters.',
    )
  }

  const dataDirRaw = (process.env.WAITLIST_DATA_DIR ?? './data').trim()
  const dataDir = isAbsolute(dataDirRaw)
    ? dataDirRaw
    : resolve(SERVER_ROOT, dataDirRaw)

  const corsOrigin = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (corsOrigin.length === 0) {
    throw new Error(
      'CORS_ORIGIN must list at least one allowed browser origin (e.g. https://ebonvaults.com).',
    )
  }

  const port = Number(process.env.PORT ?? '8787')
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.')
  }

  const host = (process.env.HOST ?? '127.0.0.1').trim() || '127.0.0.1'

  return {
    token,
    dataDir,
    corsOrigin,
    port,
    host,
    maxBodyBytes: 16_384,
    rateLimitWindowMs: 60_000,
    rateLimitMax: 60,
  }
}
