import type { StoragePlan } from '../types'

const STORAGE_PLANS: StoragePlan[] = ['essential', 'plus', 'premium']

export function isStoragePlan(value: string | null | undefined): value is StoragePlan {
  return value !== null && value !== undefined && STORAGE_PLANS.includes(value as StoragePlan)
}

/** Home waitlist deep link with an optional preferred plan. */
export function waitlistPath(plan?: StoragePlan): string {
  if (!plan) return '/#waitlist'
  return `/?plan=${plan}#waitlist`
}
