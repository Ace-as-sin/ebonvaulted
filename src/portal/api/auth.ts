/**
 * Better Auth integration surface.
 *
 * Known working: GET /api/auth/get-session
 * Passkey + invitation flows are structured here but may not be live yet.
 * Do not invent password authentication.
 */

import { apiRequest } from './client'
import { isStorageMockMode } from './config'
import { mockGetSession, mockSignOut } from './mocks'
import type { SessionResponse } from './types'
import { StorageApiError } from './types'

export async function getSession(): Promise<SessionResponse> {
  if (isStorageMockMode()) {
    return mockGetSession()
  }

  try {
    return await apiRequest<SessionResponse>('/api/auth/get-session', {
      method: 'GET',
    })
  } catch (err) {
    if (err instanceof StorageApiError && err.code === 'unauthorized') {
      return { session: null, user: null }
    }
    // Some Better Auth builds return 200 with null body fields when logged out.
    throw err
  }
}

/**
 * Sign out via Better Auth. Endpoint path may be adjusted when backend lands.
 * Planned: POST /api/auth/sign-out
 */
export async function signOut(): Promise<void> {
  if (isStorageMockMode()) {
    mockSignOut()
    return
  }
  await apiRequest('/api/auth/sign-out', { method: 'POST' })
}

/**
 * Passkey login — backend not finalized.
 * Planned Better Auth passkey authenticate flow.
 */
export async function beginPasskeySignIn(): Promise<{ status: 'not_ready' }> {
  if (isStorageMockMode()) {
    return { status: 'not_ready' }
  }
  // When ready, call Better Auth passkey endpoints / WebAuthn ceremony here.
  return { status: 'not_ready' }
}

/**
 * Invitation redemption — backend not finalized.
 * Planned: POST /api/auth/invitation/redeem (or Better Auth equivalent)
 */
export async function redeemInvitation(_token: string): Promise<{
  status: 'not_ready'
}> {
  void _token
  return { status: 'not_ready' }
}

/**
 * Passkey enrollment after invitation — backend not finalized.
 */
export async function beginPasskeyRegistration(): Promise<{
  status: 'not_ready'
}> {
  return { status: 'not_ready' }
}
