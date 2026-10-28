/**
 * Creates a SQLite backup via VACUUM INTO.
 * Store backups separately from encryption keys.
 */
import { mkdirSync, chmodSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { loadConfig } from './config.js'

function timestamp(): string {
  return new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
}

function main() {
  const config = loadConfig()
  mkdirSync(config.backupDir, { recursive: true })

  if (!existsSync(config.databasePath)) {
    console.error(`Database not found: ${config.databasePath}`)
    process.exit(1)
  }

  const destPath = join(config.backupDir, `waitlist-${timestamp()}.db`)
  // VACUUM INTO requires a forward-slash or escaped path that SQLite accepts
  const sqlitePath = destPath.replaceAll('\\', '/')

  const source = new DatabaseSync(config.databasePath)
  try {
    source.exec(`VACUUM INTO '${sqlitePath.replaceAll("'", "''")}'`)
    try {
      chmodSync(destPath, 0o600)
    } catch {
      // Windows ACL note — see docs/DEPLOYMENT-WINDOWS.md
    }
    console.log(`Backup written: ${destPath}`)
    console.log(
      'Store this file separately from EMAIL_ENCRYPTION_KEY / EMAIL_HMAC_KEY.',
    )
  } finally {
    source.close()
  }
}

main()
