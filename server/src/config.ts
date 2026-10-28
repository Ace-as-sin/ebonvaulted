import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'
import { z } from 'zod'

loadEnv({ path: resolve(process.cwd(), '.env') })

const hexKey = z
  .string()
  .regex(/^[0-9a-fA-F]{64}$/, 'Key must be 64 hex characters (32 bytes)')

const envSchema = z.object({
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().positive().default(8787),
  CORS_ORIGINS: z
    .string()
    .default(
      'http://localhost:5173,https://ebonvaults.com,https://www.ebonvaults.com',
    ),
  DATABASE_PATH: z.string().default('./data/waitlist.db'),
  EMAIL_ENCRYPTION_KEY: hexKey,
  EMAIL_HMAC_KEY: hexKey,
  CONSENT_POLICY_VERSION: z.string().min(1).default('waitlist-v1'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  BODY_LIMIT_BYTES: z.coerce.number().int().positive().default(8192),
  BACKUP_DIR: z.string().default('./backups'),
})

export type AppConfig = {
  host: string
  port: number
  corsOrigins: string[]
  databasePath: string
  emailEncryptionKey: Buffer
  emailHmacKey: Buffer
  consentPolicyVersion: string
  rateLimitMax: number
  rateLimitWindowMs: number
  bodyLimitBytes: number
  backupDir: string
}

export function loadConfig(
  env: NodeJS.ProcessEnv = process.env,
): AppConfig {
  const parsed = envSchema.safeParse(env)
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    throw new Error(`Invalid server configuration: ${details}`)
  }

  const data = parsed.data
  return {
    host: data.HOST,
    port: data.PORT,
    corsOrigins: data.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    databasePath: resolve(process.cwd(), data.DATABASE_PATH),
    emailEncryptionKey: Buffer.from(data.EMAIL_ENCRYPTION_KEY, 'hex'),
    emailHmacKey: Buffer.from(data.EMAIL_HMAC_KEY, 'hex'),
    consentPolicyVersion: data.CONSENT_POLICY_VERSION,
    rateLimitMax: data.RATE_LIMIT_MAX,
    rateLimitWindowMs: data.RATE_LIMIT_WINDOW_MS,
    bodyLimitBytes: data.BODY_LIMIT_BYTES,
    backupDir: resolve(process.cwd(), data.BACKUP_DIR),
  }
}
