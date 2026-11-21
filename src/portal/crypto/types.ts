/**
 * Client-side encryption types for Ebon Vaults space storage.
 *
 * IMPORTANT: Per-file keys currently remain in memory only.
 * Secure wrapping, cross-device recovery, and passkey-bound keys are
 * NOT implemented — see docs/ENCRYPTION.md and docs/SECURITY_INTEGRATIONS.md.
 */

export const ENCRYPTION_ALGORITHM = 'AES-GCM' as const
export const ENCRYPTION_KEY_LENGTH = 256
export const GCM_IV_BYTES = 12
export const GCM_TAG_BYTES = 16
/** 8-byte random file nonce + 4-byte BE chunk index → 12-byte GCM IV. */
export const FILE_NONCE_BYTES = 8
/** Plaintext bytes per chunk for large-file encryption. */
export const CHUNK_PLAINTEXT_BYTES = 4 * 1024 * 1024
/**
 * Files at or below this size use single-shot (v1) encryption.
 * Larger files use chunked (v2) encryption via File.slice.
 */
export const MAX_IN_MEMORY_ENCRYPT_BYTES = 64 * 1024 * 1024

export interface EncryptedPayload {
  /**
   * Ciphertext as a Blob. For chunked files this is composed of per-chunk
   * parts so the browser can avoid one giant contiguous ArrayBuffer.
   */
  ciphertext: Blob
  /**
   * v1: random 12-byte IV.
   * v2: IV for chunk 0 (fileNonce || 0x00000000) — prefer fileNonce for derivation.
   */
  iv: Uint8Array
  /** Raw AES-256 key bytes — NEVER send to the server or log. */
  fileKeyRaw: ArrayBuffer
  /** AES-GCM ciphertext of the UTF-8 filename (includes auth tag). */
  encryptedFilename: ArrayBuffer
  filenameIv: Uint8Array
  version: 1 | 2
  plaintextSize: number
  /** Present for version 2. */
  chunkSize?: number
  chunkCount?: number
  /** 8-byte random nonce used to derive per-chunk IVs (version 2). */
  fileNonce?: Uint8Array
}

export interface EncryptOptions {
  onProgress?: (ratio: number) => void
  signal?: AbortSignal
  /** Override plaintext chunk size (default CHUNK_PLAINTEXT_BYTES). */
  chunkSize?: number
  /** Force chunked (v2) path even for small files — used in tests. */
  forceChunked?: boolean
}

export interface DecryptOptions {
  onProgress?: (ratio: number) => void
  signal?: AbortSignal
}

export interface DecryptedPayload {
  plaintext: Blob
  filename?: string
}
