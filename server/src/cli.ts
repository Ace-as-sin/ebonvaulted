#!/usr/bin/env node
/**
 * Local-only waitlist administration CLI.
 * Never expose these operations over a public HTTP API.
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadConfig } from './config.js'
import {
  countByColumn,
  countSignups,
  deleteByEmail,
  deleteById,
  exportDecryptedRows,
  openDatabase,
} from './db.js'
import { PRIVACY_FEATURE_LABELS } from './schema.js'

function usage(): never {
  console.log(`Ebon Vaults waitlist CLI (local only)

Usage:
  npm run cli -- count
  npm run cli -- by-plan
  npm run cli -- by-use
  npm run cli -- by-privacy
  npm run cli -- export [outfile.csv]
  npm run cli -- delete-email <email>
  npm run cli -- delete-id <uuid>
`)
  process.exit(1)
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

function main() {
  const [, , command, arg] = process.argv
  if (!command) usage()

  const config = loadConfig()
  const db = openDatabase(config.databasePath)

  try {
    switch (command) {
      case 'count': {
        console.log(`Unique registrations: ${countSignups(db)}`)
        break
      }
      case 'by-plan': {
        console.log('Signups by storage plan:')
        for (const row of countByColumn(db, 'storage_plan')) {
          console.log(`  ${row.key}: ${row.count}`)
        }
        break
      }
      case 'by-use': {
        console.log('Interest by intended use:')
        for (const row of countByColumn(db, 'intended_use')) {
          console.log(`  ${row.key}: ${row.count}`)
        }
        break
      }
      case 'by-privacy': {
        console.log('Most important privacy feature:')
        for (const row of countByColumn(db, 'privacy_feature')) {
          const label =
            PRIVACY_FEATURE_LABELS[
              row.key as keyof typeof PRIVACY_FEATURE_LABELS
            ] ?? row.key
          console.log(`  ${label}: ${row.count}`)
        }
        break
      }
      case 'export': {
        const rows = exportDecryptedRows(db, config)
        const header = [
          'id',
          'email',
          'storage_plan',
          'intended_use',
          'privacy_feature',
          'feedback',
          'consent_at',
          'consent_policy_version',
          'created_at',
        ]
        const lines = [
          header.join(','),
          ...rows.map((row) =>
            [
              row.id,
              row.email,
              row.storage_plan,
              row.intended_use,
              row.privacy_feature,
              row.feedback,
              row.consent_at,
              row.consent_policy_version,
              row.created_at,
            ]
              .map((cell) => csvEscape(String(cell)))
              .join(','),
          ),
        ]
        const outfile = resolve(
          process.cwd(),
          arg ?? `waitlist-export-${Date.now()}.csv`,
        )
        writeFileSync(outfile, `${lines.join('\n')}\n`, { mode: 0o600 })
        console.log(`Exported ${rows.length} row(s) to ${outfile}`)
        console.log(
          'Keep this CSV offline. It contains plaintext email addresses.',
        )
        break
      }
      case 'delete-email': {
        if (!arg) usage()
        const deleted = deleteByEmail(db, config, arg)
        console.log(deleted ? 'Deleted registration.' : 'No matching registration.')
        break
      }
      case 'delete-id': {
        if (!arg) usage()
        const deleted = deleteById(db, arg)
        console.log(deleted ? 'Deleted registration.' : 'No matching registration.')
        break
      }
      default:
        usage()
    }
  } finally {
    db.close()
  }
}

main()
