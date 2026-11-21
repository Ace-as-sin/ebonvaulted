import { isStorageMockMode, storageApiUrl } from './config'
import { StorageApiError, type ApiErrorCode } from './types'

export type UnauthorizedHandler = () => void

let onUnauthorized: UnauthorizedHandler | null = null

/** Register a callback invoked when the API returns 401. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler
}

/** Notify the auth layer of an unauthorized response (e.g. from XHR uploads). */
export function notifyUnauthorized(): void {
  onUnauthorized?.()
}

function classifyStatus(status: number): ApiErrorCode {
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status === 413) return 'payload_too_large'
  if (status >= 500) return 'unavailable'
  return 'unknown'
}

function customerMessage(code: ApiErrorCode): string {
  switch (code) {
    case 'unauthorized':
      return 'Your session has expired. Please sign in again.'
    case 'forbidden':
      return 'You do not have access to that resource.'
    case 'not_found':
      return 'That item could not be found.'
    case 'conflict':
      return 'That action conflicts with the current state. Try again.'
    case 'payload_too_large':
      return 'That file is too large for your remaining space.'
    case 'network':
      return 'Could not reach the storage service. Check your connection.'
    case 'unavailable':
      return 'The storage service is temporarily unavailable.'
    case 'not_configured':
      return 'Storage is not configured for this environment.'
    case 'mock_only':
      return 'This action is only available in local mock mode.'
    case 'invalid_response':
      return 'Received an unexpected response from the storage service.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'credentials'> {
  /** Default true — Better Auth session cookies. */
  credentials?: RequestCredentials
  /** Parse JSON body (default true). Set false for binary downloads. */
  json?: boolean
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { json = true, headers, credentials = 'include', ...rest } = options
  const url = storageApiUrl(path)

  let response: Response
  try {
    response = await fetch(url, {
      ...rest,
      credentials,
      headers,
    })
  } catch {
    throw new StorageApiError('network', customerMessage('network'))
  }

  if (response.status === 401) {
    onUnauthorized?.()
    throw new StorageApiError(
      'unauthorized',
      customerMessage('unauthorized'),
      401,
    )
  }

  if (!response.ok) {
    const code = classifyStatus(response.status)
    throw new StorageApiError(code, customerMessage(code), response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  if (!json) {
    return response as unknown as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new StorageApiError(
      'invalid_response',
      customerMessage('invalid_response'),
      response.status,
    )
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new StorageApiError(
      'invalid_response',
      customerMessage('invalid_response'),
      response.status,
    )
  }
}

export async function apiRequestBlob(
  path: string,
  options: Omit<ApiRequestOptions, 'json'> = {},
): Promise<Blob> {
  const response = await apiRequest<Response>(path, {
    ...options,
    json: false,
  })
  return response.blob()
}

export function assertNotProductionMock(): void {
  if (isStorageMockMode()) return
  // no-op outside mock mode
}

export function requireMockMode(): void {
  if (!isStorageMockMode()) {
    throw new StorageApiError(
      'mock_only',
      customerMessage('mock_only'),
    )
  }
}
