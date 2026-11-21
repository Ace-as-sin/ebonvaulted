/**
 * Typed storage API client for planned Fastify endpoints.
 * Schemas are provisional — see docs/STORAGE_API.md.
 */

import {
  apiRequest,
  apiRequestBlob,
  notifyUnauthorized,
  setUnauthorizedHandler,
} from './client'
import { isStorageMockMode, storageApiUrl } from './config'
import {
  mockDelete,
  mockDownload,
  mockGetStorage,
  mockListFiles,
  mockUpload,
} from './mocks'
import {
  StorageApiError,
  type FileEncryptionMeta,
  type FileListResponse,
  type StorageQuota,
  type UploadResult,
} from './types'

// Re-export so callers can clear session wiring without importing client directly.
export { setUnauthorizedHandler }

export async function listFiles(): Promise<FileListResponse> {
  if (isStorageMockMode()) return mockListFiles()
  return apiRequest<FileListResponse>('/api/files', { method: 'GET' })
}

export async function getStorageQuota(): Promise<StorageQuota> {
  if (isStorageMockMode()) return mockGetStorage()
  return apiRequest<StorageQuota>('/api/storage', { method: 'GET' })
}

export interface UploadEncryptedFileInput {
  /** Encrypted ciphertext blob (never plaintext). */
  ciphertext: Blob
  /** Opaque name for the server (prefer encrypted/opaque filename). */
  storedName: string
  contentType?: string
  encryption: FileEncryptionMeta
  onProgress?: (ratio: number) => void
  signal?: AbortSignal
}

/**
 * Upload an already-encrypted file.
 * Uses XHR so upload progress events are available.
 * Resumable uploads are intentionally not implemented yet.
 */
export async function uploadEncryptedFile(
  input: UploadEncryptedFileInput,
): Promise<UploadResult> {
  if (isStorageMockMode()) {
    input.onProgress?.(0.3)
    const result = await mockUpload(input.ciphertext, {
      name: input.storedName,
      contentType: input.contentType ?? 'application/octet-stream',
      encryption: input.encryption,
    })
    input.onProgress?.(1)
    return result
  }

  const form = new FormData()
  form.append('file', input.ciphertext, input.storedName)
  form.append('encryption', JSON.stringify(input.encryption))
  form.append('storedName', input.storedName)
  if (input.contentType) {
    form.append('contentType', input.contentType)
  }

  return uploadWithProgress(storageApiUrl('/api/files/upload'), form, {
    onProgress: input.onProgress,
    signal: input.signal,
  })
}

function uploadWithProgress(
  url: string,
  form: FormData,
  opts: { onProgress?: (ratio: number) => void; signal?: AbortSignal },
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.withCredentials = true

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !opts.onProgress) return
      opts.onProgress(event.loaded / event.total)
    }

    xhr.onload = () => {
      if (xhr.status === 401) {
        notifyUnauthorized()
        reject(
          new StorageApiError(
            'unauthorized',
            'Your session has expired. Please sign in again.',
            401,
          ),
        )
        return
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        const code =
          xhr.status === 413
            ? 'payload_too_large'
            : xhr.status >= 500
              ? 'unavailable'
              : 'unknown'
        reject(
          new StorageApiError(
            code,
            code === 'payload_too_large'
              ? 'That file is too large for your remaining space.'
              : 'Upload failed. Please try again.',
            xhr.status,
          ),
        )
        return
      }
      try {
        resolve(JSON.parse(xhr.responseText) as UploadResult)
      } catch {
        reject(
          new StorageApiError(
            'invalid_response',
            'Received an unexpected response from the storage service.',
            xhr.status,
          ),
        )
      }
    }

    xhr.onerror = () => {
      reject(
        new StorageApiError(
          'network',
          'Could not reach the storage service. Check your connection.',
        ),
      )
    }

    xhr.onabort = () => {
      reject(new StorageApiError('unknown', 'Upload cancelled.'))
    }

    if (opts.signal) {
      if (opts.signal.aborted) {
        xhr.abort()
        return
      }
      opts.signal.addEventListener('abort', () => xhr.abort(), { once: true })
    }

    xhr.send(form)
  })
}

export async function downloadEncryptedFile(id: string): Promise<Blob> {
  if (isStorageMockMode()) return mockDownload(id)
  return apiRequestBlob(`/api/files/${encodeURIComponent(id)}`, {
    method: 'GET',
  })
}

export async function deleteFile(id: string): Promise<void> {
  if (isStorageMockMode()) {
    mockDelete(id)
    return
  }
  await apiRequest(`/api/files/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
