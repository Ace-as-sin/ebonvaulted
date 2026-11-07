import { getStore } from '@netlify/blobs'

const SIGNUPS_KEY = 'signups.jsonl'
const META_KEY = 'meta.json'

function store() {
  return getStore({ name: 'waitlist', consistency: 'strong' })
}

async function readMeta(s) {
  try {
    const meta = await s.get(META_KEY, { type: 'json' })
    if (!meta || typeof meta !== 'object') {
      return { signupCount: 0, lastSignupAt: null }
    }
    return {
      signupCount: Number(meta.signupCount) || 0,
      lastSignupAt:
        typeof meta.lastSignupAt === 'string' ? meta.lastSignupAt : null,
    }
  } catch {
    return { signupCount: 0, lastSignupAt: null }
  }
}

export async function appendSignup(record) {
  const s = store()
  const existing = (await s.get(SIGNUPS_KEY, { type: 'text' })) ?? ''
  const line = `${JSON.stringify(record)}\n`
  await s.set(SIGNUPS_KEY, existing + line)

  const meta = await readMeta(s)
  meta.signupCount += 1
  meta.lastSignupAt = record.receivedAt ?? new Date().toISOString()
  await s.setJSON(META_KEY, meta)
  return meta
}

export async function getStats() {
  const s = store()
  const meta = await readMeta(s)
  const text = (await s.get(SIGNUPS_KEY, { type: 'text' })) ?? ''
  return {
    signupCount: meta.signupCount,
    lastSignupAt: meta.lastSignupAt,
    dataFileBytes: Buffer.byteLength(text, 'utf8'),
  }
}

export async function assertWritable() {
  const s = store()
  await s.set('write-probe', String(Date.now()))
}
