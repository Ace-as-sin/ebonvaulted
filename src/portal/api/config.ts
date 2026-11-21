/**
 * Storage API base URL resolution.
 *
 * Dev: leave unset and use Vite proxy `/api` → http://127.0.0.1:8788
 * Prod: set VITE_STORAGE_API_BASE=https://storage-api.ebonvaults.com
 *
 * Never hardcode the SSH tunnel or localhost into production builds.
 */

export function getStorageApiBase(): string {
  const raw = (import.meta.env.VITE_STORAGE_API_BASE as string | undefined)?.trim()
  if (raw) {
    return raw.replace(/\/$/, '')
  }
  // Same-origin relative paths (Vite proxy in development).
  return ''
}

/**
 * Mocks are allowed only in Vite DEV when explicitly enabled.
 * Production builds never use mock storage/auth data.
 */
export function isStorageMockMode(): boolean {
  if (!import.meta.env.DEV) return false
  const flag = (import.meta.env.VITE_STORAGE_USE_MOCKS as string | undefined)
    ?.trim()
    .toLowerCase()
  return flag === 'true' || flag === '1'
}

export function storageApiUrl(path: string): string {
  const base = getStorageApiBase()
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
