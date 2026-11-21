/**
 * Session-scoped in-memory store for per-file keys.
 *
 * This is an interim development aid so upload→download round-trips work
 * in a single browser session. It is NOT a production key-management system:
 * - Keys are lost on refresh / new device
 * - Keys are not wrapped or synced
 * - Passkeys do not automatically unlock these keys
 *
 * Replace with reviewed wrapping + recovery before claiming zero-knowledge.
 */

const keys = new Map<string, ArrayBuffer>()

export function rememberFileKey(fileId: string, keyRaw: ArrayBuffer): void {
  keys.set(fileId, keyRaw.slice(0))
}

export function takeFileKey(fileId: string): ArrayBuffer | undefined {
  return keys.get(fileId)
}

export function forgetFileKey(fileId: string): void {
  keys.delete(fileId)
}

export function clearAllFileKeys(): void {
  keys.clear()
}
