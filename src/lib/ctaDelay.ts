import type { CSSProperties } from 'react'

const SWEEP_PERIOD_MS = 7200

/** Stable mid-cycle animation offset so CTAs don't sweep in sync. */
export function ctaDelayStyle(seed: string | number): CSSProperties {
  const str = String(seed)
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  const delaySec = -((hash >>> 0) % SWEEP_PERIOD_MS) / 1000
  return { ['--cta-delay' as string]: `${delaySec}s` }
}
