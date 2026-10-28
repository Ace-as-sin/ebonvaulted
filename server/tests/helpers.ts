import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'
import type { AppConfig } from '../src/config.js'
import { openDatabase } from '../src/db.js'
import { buildApp } from '../src/app.js'
import type { DatabaseSync } from 'node:sqlite'

export function testKeys() {
  return {
    emailEncryptionKey: randomBytes(32),
    emailHmacKey: randomBytes(32),
  }
}

export function makeTestConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  const dir = mkdtempSync(join(tmpdir(), 'ebon-waitlist-'))
  const keys = testKeys()
  return {
    host: '127.0.0.1',
    port: 0,
    corsOrigins: ['http://localhost:5173', 'https://ebonvaults.com'],
    databasePath: join(dir, 'test.db'),
    emailEncryptionKey: keys.emailEncryptionKey,
    emailHmacKey: keys.emailHmacKey,
    consentPolicyVersion: 'waitlist-v1',
    rateLimitMax: 1000,
    rateLimitWindowMs: 60_000,
    bodyLimitBytes: 8192,
    backupDir: join(dir, 'backups'),
    ...overrides,
  }
}

export async function makeTestApp(overrides: Partial<AppConfig> = {}): Promise<{
  app: Awaited<ReturnType<typeof buildApp>>
  db: DatabaseSync
  config: AppConfig
}> {
  const config = makeTestConfig(overrides)
  const db = openDatabase(config.databasePath)
  const app = await buildApp({ config, db })
  return { app, db, config }
}

export const validPayload = {
  email: 'person@example.com',
  plan: 'plus' as const,
  intendedUse: 'personal' as const,
  privacyFeature: 'encryption' as const,
  feedback: 'Keep my files private',
  consent: true as const,
}
