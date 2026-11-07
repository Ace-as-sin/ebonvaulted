import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'

const SIGNUPS_FILE = 'signups.jsonl'
const META_FILE = 'meta.json'

export function createStore(dataDir) {
  mkdirSync(dataDir, { recursive: true })

  const signupsPath = join(dataDir, SIGNUPS_FILE)
  const metaPath = join(dataDir, META_FILE)

  if (!existsSync(signupsPath)) {
    writeFileSync(signupsPath, '', 'utf8')
  }
  if (!existsSync(metaPath)) {
    writeFileSync(
      metaPath,
      JSON.stringify({ signupCount: 0, lastSignupAt: null }, null, 2),
      'utf8',
    )
  }

  function readMeta() {
    try {
      const raw = JSON.parse(readFileSync(metaPath, 'utf8'))
      return {
        signupCount: Number(raw.signupCount) || 0,
        lastSignupAt:
          typeof raw.lastSignupAt === 'string' ? raw.lastSignupAt : null,
      }
    } catch {
      return { signupCount: 0, lastSignupAt: null }
    }
  }

  function writeMeta(meta) {
    writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf8')
  }

  return {
    /** Persist a validated signup. Never call for dry-runs. */
    appendSignup(record) {
      appendFileSync(signupsPath, JSON.stringify(record) + '\n', 'utf8')
      const meta = readMeta()
      meta.signupCount += 1
      meta.lastSignupAt = record.receivedAt ?? new Date().toISOString()
      writeMeta(meta)
      return meta
    },

    /** Non-PII stats for /health. */
    getStats() {
      const meta = readMeta()
      let bytes = 0
      try {
        bytes = statSync(signupsPath).size
      } catch {
        bytes = 0
      }
      return {
        signupCount: meta.signupCount,
        lastSignupAt: meta.lastSignupAt,
        dataFileBytes: bytes,
      }
    },

    /** Confirms the data directory is writable without storing a signup. */
    assertWritable() {
      mkdirSync(dataDir, { recursive: true })
      const probe = join(dataDir, '.write-probe')
      writeFileSync(probe, String(Date.now()), 'utf8')
    },
  }
}
