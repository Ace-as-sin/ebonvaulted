import { base64ToBytes, bufferToBase64 } from './bytes'
import {
  CHUNK_PLAINTEXT_BYTES,
  ENCRYPTION_ALGORITHM,
  ENCRYPTION_KEY_LENGTH,
  FILE_NONCE_BYTES,
  GCM_IV_BYTES,
  GCM_TAG_BYTES,
  MAX_IN_MEMORY_ENCRYPT_BYTES,
  type DecryptOptions,
  type EncryptedPayload,
  type EncryptOptions,
} from './types'
import type { FileEncryptionMeta } from '../api/types'

export class EncryptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EncryptionError'
  }
}

async function generateFileKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ENCRYPTION_ALGORITHM, length: ENCRYPTION_KEY_LENGTH },
    true,
    ['encrypt', 'decrypt'],
  )
}

function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}

async function importRawKey(raw: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: ENCRYPTION_ALGORITHM, length: ENCRYPTION_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  )
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new EncryptionError('Encryption cancelled.')
  }
}

/**
 * Derive a unique 12-byte GCM IV: 8-byte file nonce || 4-byte big-endian index.
 * Never reuse (fileNonce, index) with the same key.
 */
export function chunkIv(fileNonce: Uint8Array, chunkIndex: number): Uint8Array {
  if (fileNonce.byteLength !== FILE_NONCE_BYTES) {
    throw new EncryptionError('Invalid file nonce length.')
  }
  if (!Number.isInteger(chunkIndex) || chunkIndex < 0 || chunkIndex > 0xffffffff) {
    throw new EncryptionError('Invalid chunk index.')
  }
  const iv = new Uint8Array(GCM_IV_BYTES)
  iv.set(fileNonce, 0)
  new DataView(iv.buffer).setUint32(FILE_NONCE_BYTES, chunkIndex, false)
  return iv
}

function packEncryptedFilename(
  filenameIv: Uint8Array,
  encryptedFilename: ArrayBuffer,
): string {
  const namePack = new Uint8Array(
    filenameIv.length + encryptedFilename.byteLength,
  )
  namePack.set(filenameIv, 0)
  namePack.set(new Uint8Array(encryptedFilename), filenameIv.length)
  return bufferToBase64(namePack)
}

async function encryptFilenameWithKey(
  key: CryptoKey,
  filename: string,
): Promise<{ encryptedFilename: ArrayBuffer; filenameIv: Uint8Array }> {
  const filenameIv = randomBytes(GCM_IV_BYTES)
  const nameBytes = new TextEncoder().encode(filename)
  const encryptedFilename = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv: filenameIv as BufferSource },
    key,
    nameBytes,
  )
  return { encryptedFilename, filenameIv }
}

async function encryptSingleShot(
  file: File | Blob,
  filename: string,
  options: EncryptOptions = {},
): Promise<EncryptedPayload> {
  assertNotAborted(options.signal)
  options.onProgress?.(0.05)

  const key = await generateFileKey()
  const iv = randomBytes(GCM_IV_BYTES)
  const plaintext = await file.arrayBuffer()
  assertNotAborted(options.signal)
  options.onProgress?.(0.4)

  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv: iv as BufferSource },
    key,
    plaintext,
  )
  options.onProgress?.(0.85)

  const { encryptedFilename, filenameIv } = await encryptFilenameWithKey(
    key,
    filename,
  )
  const fileKeyRaw = await crypto.subtle.exportKey('raw', key)
  options.onProgress?.(1)

  return {
    ciphertext: new Blob([new Uint8Array(ciphertextBuf)], {
      type: 'application/octet-stream',
    }),
    iv,
    fileKeyRaw,
    encryptedFilename,
    filenameIv,
    version: 1,
    plaintextSize: file.size,
  }
}

/**
 * Chunked AES-256-GCM. Reads plaintext via Blob.slice so large files are not
 * loaded into a single ArrayBuffer. Ciphertext is a Blob of chunk parts.
 */
export async function encryptFileChunked(
  file: File | Blob,
  filename: string,
  options: EncryptOptions = {},
): Promise<EncryptedPayload> {
  const chunkSize = options.chunkSize ?? CHUNK_PLAINTEXT_BYTES
  if (!Number.isInteger(chunkSize) || chunkSize < 1) {
    throw new EncryptionError('Invalid chunk size.')
  }

  assertNotAborted(options.signal)

  const key = await generateFileKey()
  const fileNonce = randomBytes(FILE_NONCE_BYTES)
  const chunkCount = Math.max(1, Math.ceil(file.size / chunkSize) || 1)
  // Empty file still produces one empty authenticated chunk.
  const effectiveCount = file.size === 0 ? 1 : chunkCount
  const parts: BlobPart[] = []

  for (let i = 0; i < effectiveCount; i++) {
    assertNotAborted(options.signal)
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const plainChunk = await file.slice(start, end).arrayBuffer()
    const iv = chunkIv(fileNonce, i)
    const cipherChunk = await crypto.subtle.encrypt(
      { name: ENCRYPTION_ALGORITHM, iv: iv as BufferSource },
      key,
      plainChunk,
    )
    parts.push(new Uint8Array(cipherChunk))
    options.onProgress?.((i + 1) / (effectiveCount + 1))
  }

  const { encryptedFilename, filenameIv } = await encryptFilenameWithKey(
    key,
    filename,
  )
  const fileKeyRaw = await crypto.subtle.exportKey('raw', key)
  options.onProgress?.(1)

  return {
    ciphertext: new Blob(parts, { type: 'application/octet-stream' }),
    iv: chunkIv(fileNonce, 0),
    fileKeyRaw,
    encryptedFilename,
    filenameIv,
    version: 2,
    plaintextSize: file.size,
    chunkSize,
    chunkCount: effectiveCount,
    fileNonce,
  }
}

/**
 * Encrypt a file. Uses single-shot AES-GCM up to 64 MiB; larger files use
 * chunked encryption (version 2) so plaintext is read in slices.
 */
export async function encryptFile(
  file: File | Blob,
  filename: string,
  options: EncryptOptions = {},
): Promise<EncryptedPayload> {
  if (options.forceChunked || file.size > MAX_IN_MEMORY_ENCRYPT_BYTES) {
    return encryptFileChunked(file, filename, options)
  }
  return encryptSingleShot(file, filename, options)
}

export async function decryptBytes(
  ciphertext: BufferSource,
  iv: BufferSource,
  fileKeyRaw: ArrayBuffer,
): Promise<ArrayBuffer> {
  const key = await importRawKey(fileKeyRaw)
  try {
    return await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      ciphertext,
    )
  } catch {
    throw new EncryptionError(
      'Decryption failed. The file may be corrupted or the key is wrong.',
    )
  }
}

export async function decryptFilename(
  encryptedFilename: BufferSource,
  filenameIv: BufferSource,
  fileKeyRaw: ArrayBuffer,
): Promise<string> {
  const plain = await decryptBytes(encryptedFilename, filenameIv, fileKeyRaw)
  return new TextDecoder().decode(plain)
}

function parseFileNonce(ivB64: string): Uint8Array {
  const bytes = base64ToBytes(ivB64)
  if (bytes.byteLength === FILE_NONCE_BYTES) return Uint8Array.from(bytes)
  // Accept 12-byte chunk-0 IV (nonce || 0).
  if (bytes.byteLength === GCM_IV_BYTES) {
    return Uint8Array.from(bytes.slice(0, FILE_NONCE_BYTES))
  }
  throw new EncryptionError('Invalid chunked file nonce in metadata.')
}

async function decryptChunkedBlob(
  ciphertext: Blob,
  meta: FileEncryptionMeta,
  fileKeyRaw: ArrayBuffer,
  options: DecryptOptions,
): Promise<Blob> {
  const chunkSize = meta.chunkSize
  const chunkCount = meta.chunkCount
  const plaintextSize = meta.plaintextSize

  if (
    !chunkSize ||
    !chunkCount ||
    plaintextSize === undefined ||
    chunkSize < 1 ||
    chunkCount < 1
  ) {
    throw new EncryptionError('Chunked encryption metadata is incomplete.')
  }

  const fileNonce = parseFileNonce(meta.iv)
  const expectedCipherSize = plaintextSize + chunkCount * GCM_TAG_BYTES
  if (ciphertext.size !== expectedCipherSize) {
    throw new EncryptionError(
      'Encrypted file size does not match chunked metadata.',
    )
  }

  const key = await importRawKey(fileKeyRaw)
  const parts: BlobPart[] = []
  let cipherOffset = 0

  for (let i = 0; i < chunkCount; i++) {
    assertNotAborted(options.signal)
    const plainLen =
      i === chunkCount - 1
        ? plaintextSize - chunkSize * (chunkCount - 1)
        : chunkSize
    const cipherLen = plainLen + GCM_TAG_BYTES
    const chunkBuf = await ciphertext
      .slice(cipherOffset, cipherOffset + cipherLen)
      .arrayBuffer()
    cipherOffset += cipherLen

    const iv = chunkIv(fileNonce, i)
    let plain: ArrayBuffer
    try {
      plain = await crypto.subtle.decrypt(
        { name: ENCRYPTION_ALGORITHM, iv: iv as BufferSource },
        key,
        chunkBuf,
      )
    } catch {
      throw new EncryptionError(
        'Decryption failed. The file may be corrupted or the key is wrong.',
      )
    }
    parts.push(new Uint8Array(plain))
    options.onProgress?.((i + 1) / chunkCount)
  }

  const out = new Blob(parts, { type: 'application/octet-stream' })
  if (out.size !== plaintextSize) {
    throw new EncryptionError('Decrypted size mismatch.')
  }
  return out
}

/**
 * Decrypt a stored ciphertext Blob using envelope metadata (v1 or v2).
 * Chunked files are decrypted slice-by-slice into a composed Blob.
 */
export async function decryptCiphertextBlob(
  ciphertext: Blob,
  meta: FileEncryptionMeta,
  fileKeyRaw: ArrayBuffer,
  options: DecryptOptions = {},
): Promise<Blob> {
  assertNotAborted(options.signal)

  if (meta.version === 2) {
    return decryptChunkedBlob(ciphertext, meta, fileKeyRaw, options)
  }

  const iv = Uint8Array.from(base64ToBytes(meta.iv))
  if (iv.byteLength !== GCM_IV_BYTES) {
    throw new EncryptionError('Invalid encryption IV in file metadata.')
  }

  options.onProgress?.(0.2)
  const buf = await ciphertext.arrayBuffer()
  assertNotAborted(options.signal)
  const plain = await decryptBytes(buf, iv, fileKeyRaw)
  options.onProgress?.(1)
  return new Blob([new Uint8Array(plain)], {
    type: 'application/octet-stream',
  })
}

/**
 * Build the encryption metadata envelope stored alongside the ciphertext.
 * Does NOT include the raw file key.
 */
export function toEncryptionMeta(
  payload: EncryptedPayload,
): FileEncryptionMeta {
  const encryptedName = packEncryptedFilename(
    payload.filenameIv,
    payload.encryptedFilename,
  )

  if (payload.version === 2) {
    if (!payload.fileNonce || !payload.chunkSize || !payload.chunkCount) {
      throw new EncryptionError('Incomplete chunked encryption payload.')
    }
    return {
      algorithm: 'AES-256-GCM',
      iv: bufferToBase64(payload.fileNonce),
      version: 2,
      wrappedKey: null,
      encryptedName,
      chunkSize: payload.chunkSize,
      chunkCount: payload.chunkCount,
      plaintextSize: payload.plaintextSize,
    }
  }

  return {
    algorithm: 'AES-256-GCM',
    iv: bufferToBase64(payload.iv),
    version: 1,
    wrappedKey: null,
    encryptedName,
  }
}

/** Opaque server-side name — no plaintext filename. */
export function opaqueStoredName(): string {
  const id = crypto.randomUUID().replace(/-/g, '')
  return `ev-${id}.enc`
}
