import { chmodSync, existsSync } from 'node:fs'
import { loadConfig } from './config.js'
import { openDatabase } from './db.js'
import { buildApp } from './app.js'

async function main() {
  const config = loadConfig()
  const db = openDatabase(config.databasePath)

  // Best-effort restrictive permissions on Unix; no-op / may fail on Windows ACL
  try {
    if (existsSync(config.databasePath)) {
      chmodSync(config.databasePath, 0o600)
    }
  } catch {
    // Windows often cannot apply POSIX modes — document ACL hardening instead
  }

  const app = await buildApp({ config, db })

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'shutting_down')
    try {
      await app.close()
      db.close()
      process.exit(0)
    } catch (error) {
      app.log.error({ err: error }, 'shutdown_failed')
      process.exit(1)
    }
  }

  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))

  await app.listen({ host: config.host, port: config.port })
  app.log.info(
    {
      host: config.host,
      port: config.port,
      corsOrigins: config.corsOrigins,
    },
    'waitlist_api_listening',
  )
}

main().catch((error: unknown) => {
  // Avoid logging secrets if config parse fails
  console.error('Failed to start waitlist API')
  if (error instanceof Error) {
    console.error(error.message)
  }
  process.exit(1)
})
