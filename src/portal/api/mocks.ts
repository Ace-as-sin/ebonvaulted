/**
 * Development-only mock storage. Gated by isStorageMockMode().
 * Never imported into production request paths without that gate.
 */

import type {
  FileListResponse,
  SessionResponse,
  StoredFileRecord,
  StorageQuota,
  UploadResult,
} from './types'

const MOCK_USER = {
  id: 'mock-user-1',
  email: 'preview@ebonvaults.local',
  name: 'Preview Customer',
  emailVerified: true,
}

let mockFiles: StoredFileRecord[] = [
  {
    id: 'mock-file-1',
    name: 'welcome-note.enc',
    contentType: 'application/octet-stream',
    sizeBytes: 2048,
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    encryption: {
      algorithm: 'AES-256-GCM',
      iv: 'AAAAAAAAAAAAAAAA',
      version: 1,
      encryptedName: null,
      wrappedKey: null,
    },
  },
]

const QUOTA_BYTES = 5 * 1024 * 1024 * 1024 // 5 GiB preview quota

const blobStore = new Map<string, Blob>()

export function mockGetSession(): SessionResponse {
  return {
    session: {
      id: 'mock-session-1',
      userId: MOCK_USER.id,
      expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    },
    user: MOCK_USER,
  }
}

export function mockListFiles(): FileListResponse {
  return { files: [...mockFiles] }
}

export function mockGetStorage(): StorageQuota {
  const usedBytes = mockFiles.reduce((sum, f) => sum + f.sizeBytes, 0)
  return {
    usedBytes,
    quotaBytes: QUOTA_BYTES,
    remainingBytes: Math.max(0, QUOTA_BYTES - usedBytes),
  }
}

export async function mockUpload(
  blob: Blob,
  meta: {
    name: string
    contentType?: string
    encryption?: StoredFileRecord['encryption']
  },
): Promise<UploadResult> {
  const id = `mock-file-${crypto.randomUUID()}`
  const record: StoredFileRecord = {
    id,
    name: meta.name,
    contentType: meta.contentType ?? 'application/octet-stream',
    sizeBytes: blob.size,
    createdAt: new Date().toISOString(),
    encryption: meta.encryption ?? null,
  }
  mockFiles = [record, ...mockFiles]
  blobStore.set(id, blob)
  return { file: record }
}

export async function mockDownload(id: string): Promise<Blob> {
  const blob = blobStore.get(id)
  if (!blob) {
    // Placeholder ciphertext for the seed file — not decryptable without a key.
    return new Blob([new Uint8Array(32)], { type: 'application/octet-stream' })
  }
  return blob
}

export function mockDelete(id: string): void {
  mockFiles = mockFiles.filter((f) => f.id !== id)
  blobStore.delete(id)
}

export function mockSignOut(): void {
  // Session is simulated; nothing to clear server-side.
}
