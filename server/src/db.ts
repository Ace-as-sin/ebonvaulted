import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import type { AppConfig } from './config.js'
import {
  decryptEmail,
  emailLookupHmac,
  encryptEmail,
} from './crypto.js'
import type { WaitlistBody } from './schema.js'

export type WaitlistRow = {
  id: string
  email_ciphertext: string
  email_lookup_hmac: string
  storage_plan: string
  intended_use: string
  privacy_feature: string
  feedback: string | null
  consent_at: string
  consent_policy_version: string
  created_at: string
}

export type InsertResult =
  | { status: 'created'; id: string }
  | { status: 'duplicate'; id: string }

export function openDatabase(databasePath: string): DatabaseSync {
  mkdirSync(dirname(databasePath), { recursive: true })
  const db = new DatabaseSync(databasePath)
  db.exec('PRAGMA journal_mode = WAL;')
  db.exec('PRAGMA foreign_keys = ON;')
  migrate(db)
  return db
}

export function migrate(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id TEXT PRIMARY KEY NOT NULL,
      email_ciphertext TEXT NOT NULL,
      email_lookup_hmac TEXT NOT NULL UNIQUE,
      storage_plan TEXT NOT NULL,
      intended_use TEXT NOT NULL,
      privacy_feature TEXT NOT NULL,
      feedback TEXT,
      consent_at TEXT NOT NULL,
      consent_policy_version TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_waitlist_created_at
      ON waitlist (created_at);

    CREATE INDEX IF NOT EXISTS idx_waitlist_storage_plan
      ON waitlist (storage_plan);

    CREATE INDEX IF NOT EXISTS idx_waitlist_intended_use
      ON waitlist (intended_use);
  `)
}

export function insertWaitlistSignup(
  db: DatabaseSync,
  config: AppConfig,
  body: WaitlistBody,
): InsertResult {
  const lookup = emailLookupHmac(body.email, config.emailHmacKey)
  const existing = db
    .prepare(`SELECT id FROM waitlist WHERE email_lookup_hmac = ? LIMIT 1`)
    .get(lookup) as { id: string } | undefined

  if (existing) {
    return { status: 'duplicate', id: existing.id }
  }

  const id = randomUUID()
  const now = new Date().toISOString()
  const ciphertext = encryptEmail(body.email, config.emailEncryptionKey)

  try {
    db.prepare(
      `INSERT INTO waitlist (
        id,
        email_ciphertext,
        email_lookup_hmac,
        storage_plan,
        intended_use,
        privacy_feature,
        feedback,
        consent_at,
        consent_policy_version,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      ciphertext,
      lookup,
      body.plan,
      body.intendedUse,
      body.privacyFeature,
      body.feedback ?? null,
      now,
      body.consentPolicyVersion ?? config.consentPolicyVersion,
      now,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (/UNIQUE constraint failed/i.test(message)) {
      const raced = db
        .prepare(
          `SELECT id FROM waitlist WHERE email_lookup_hmac = ? LIMIT 1`,
        )
        .get(lookup) as { id: string } | undefined
      if (raced) return { status: 'duplicate', id: raced.id }
    }
    throw error
  }

  return { status: 'created', id }
}

export function countSignups(db: DatabaseSync): number {
  const row = db.prepare(`SELECT COUNT(*) AS count FROM waitlist`).get() as {
    count: number
  }
  return Number(row.count)
}

export function countByColumn(
  db: DatabaseSync,
  column: 'storage_plan' | 'intended_use' | 'privacy_feature',
): Array<{ key: string; count: number }> {
  return (
    db
      .prepare(
        `SELECT ${column} AS key, COUNT(*) AS count
         FROM waitlist
         GROUP BY ${column}
         ORDER BY count DESC, key ASC`,
      )
      .all() as Array<{ key: string; count: number }>
  ).map((row) => ({ key: row.key, count: Number(row.count) }))
}

export function listRows(db: DatabaseSync): WaitlistRow[] {
  return db
    .prepare(`SELECT * FROM waitlist ORDER BY created_at ASC`)
    .all() as WaitlistRow[]
}

export function findByEmail(
  db: DatabaseSync,
  config: AppConfig,
  email: string,
): WaitlistRow | undefined {
  const lookup = emailLookupHmac(email, config.emailHmacKey)
  return db
    .prepare(`SELECT * FROM waitlist WHERE email_lookup_hmac = ? LIMIT 1`)
    .get(lookup) as WaitlistRow | undefined
}

export function deleteByEmail(
  db: DatabaseSync,
  config: AppConfig,
  email: string,
): boolean {
  const lookup = emailLookupHmac(email, config.emailHmacKey)
  const result = db
    .prepare(`DELETE FROM waitlist WHERE email_lookup_hmac = ?`)
    .run(lookup)
  return Number(result.changes) > 0
}

export function deleteById(db: DatabaseSync, id: string): boolean {
  const result = db.prepare(`DELETE FROM waitlist WHERE id = ?`).run(id)
  return Number(result.changes) > 0
}

export function exportDecryptedRows(
  db: DatabaseSync,
  config: AppConfig,
): Array<{
  id: string
  email: string
  storage_plan: string
  intended_use: string
  privacy_feature: string
  feedback: string
  consent_at: string
  consent_policy_version: string
  created_at: string
}> {
  return listRows(db).map((row) => ({
    id: row.id,
    email: decryptEmail(row.email_ciphertext, config.emailEncryptionKey),
    storage_plan: row.storage_plan,
    intended_use: row.intended_use,
    privacy_feature: row.privacy_feature,
    feedback: row.feedback ?? '',
    consent_at: row.consent_at,
    consent_policy_version: row.consent_policy_version,
    created_at: row.created_at,
  }))
}
