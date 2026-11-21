/**
 * Planned storage API contracts for the Ubuntu Fastify backend.
 * Schemas are provisional — adjust when the backend is finalized.
 * Do not treat these as authoritative wire formats yet.
 */

/** Better Auth session shape (subset we rely on). */
export interface AuthUser {
  id: string
  email: string
  name?: string | null
  emailVerified?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AuthSession {
  id: string
  userId: string
  expiresAt: string
  token?: string
  createdAt?: string
  updatedAt?: string
}

export interface SessionResponse {
  session: AuthSession | null
  user: AuthUser | null
}

/**
 * File metadata returned by GET /api/files.
 * Filenames on the wire should be ciphertext/opaque when encryption is enabled.
 */
export interface StoredFileRecord {
  id: string
  /** Opaque or encrypted filename as stored by the API. */
  name: string
  /** MIME hint if the server stores one (may be generic application/octet-stream). */
  contentType?: string
  sizeBytes: number
  createdAt: string
  updatedAt?: string
  /**
   * Encryption envelope metadata the client needs to decrypt.
   * Exact fields TBD with the backend.
   */
  encryption?: FileEncryptionMeta | null
}

export interface FileEncryptionMeta {
  algorithm: 'AES-256-GCM'
  /**
   * Base64 IV/nonce.
   * - version 1: 12-byte GCM IV for the single ciphertext blob
   * - version 2: 8-byte file nonce; per-chunk IV = nonce || BE(chunkIndex)
   */
  iv: string
  /** Envelope format. 1 = single-shot, 2 = chunked. */
  version: 1 | 2
  /**
   * Optional wrapped per-file key (base64).
   * Wrapping scheme is NOT implemented yet — see docs/ENCRYPTION.md.
   */
  wrappedKey?: string | null
  /** Optional encrypted original filename (base64 ciphertext). */
  encryptedName?: string | null
  /** version 2: plaintext bytes per chunk (last chunk may be shorter). */
  chunkSize?: number
  /** version 2: number of ciphertext chunks. */
  chunkCount?: number
  /** version 2: original plaintext size in bytes (integrity check). */
  plaintextSize?: number
}

export interface FileListResponse {
  files: StoredFileRecord[]
}

export interface StorageQuota {
  usedBytes: number
  quotaBytes: number
  remainingBytes: number
}

export interface UploadResult {
  file: StoredFileRecord
}

/** Client-facing errors — never surface raw server bodies to customers. */
export type ApiErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'payload_too_large'
  | 'network'
  | 'unavailable'
  | 'invalid_response'
  | 'not_configured'
  | 'mock_only'
  | 'unknown'

export class StorageApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number | null

  constructor(code: ApiErrorCode, message: string, status: number | null = null) {
    super(message)
    this.name = 'StorageApiError'
    this.code = code
    this.status = status
  }
}
