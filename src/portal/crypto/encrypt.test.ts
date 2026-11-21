import { describe, expect, it } from 'vitest'
import { base64ToBytes, bufferToBase64 } from './bytes'
import {
  chunkIv,
  decryptBytes,
  decryptCiphertextBlob,
  decryptFilename,
  encryptFile,
  encryptFileChunked,
  toEncryptionMeta,
} from './encrypt'
import { FILE_NONCE_BYTES, GCM_TAG_BYTES } from './types'

describe('portal crypto (AES-256-GCM)', () => {
  it('round-trips plaintext and filename (single-shot v1)', async () => {
    const text = 'Ebon Vaults space storage test vector'
    const file = new File([text], 'notes.txt', { type: 'text/plain' })
    const encrypted = await encryptFile(file, 'notes.txt')

    expect(encrypted.version).toBe(1)
    expect(encrypted.iv.byteLength).toBe(12)
    expect(encrypted.fileKeyRaw.byteLength).toBe(32)
    expect(encrypted.ciphertext.size).toBeGreaterThan(text.length)

    const plainBuf = await encrypted.ciphertext.arrayBuffer()
    const plain = await decryptBytes(
      plainBuf,
      encrypted.iv,
      encrypted.fileKeyRaw,
    )
    expect(new TextDecoder().decode(plain)).toBe(text)

    const name = await decryptFilename(
      encrypted.encryptedFilename,
      encrypted.filenameIv,
      encrypted.fileKeyRaw,
    )
    expect(name).toBe('notes.txt')
  })

  it('produces different ciphertext for the same plaintext (random IV)', async () => {
    const file = new File(['same bytes'], 'a.bin')
    const a = await encryptFile(file, 'a.bin')
    const b = await encryptFile(file, 'a.bin')
    expect(bufferToBase64(await a.ciphertext.arrayBuffer())).not.toBe(
      bufferToBase64(await b.ciphertext.arrayBuffer()),
    )
    expect(bufferToBase64(a.iv)).not.toBe(bufferToBase64(b.iv))
  })

  it('fails decryption with a wrong key', async () => {
    const file = new File(['secret'], 's.txt')
    const encrypted = await encryptFile(file, 's.txt')
    const wrongKey = crypto.getRandomValues(new Uint8Array(32)).buffer
    await expect(
      decryptBytes(
        await encrypted.ciphertext.arrayBuffer(),
        encrypted.iv,
        wrongKey,
      ),
    ).rejects.toThrow(/Decryption failed/)
  })

  it('toEncryptionMeta omits raw key and keeps IV (v1)', async () => {
    const file = new File(['x'], 'x.txt')
    const encrypted = await encryptFile(file, 'x.txt')
    const meta = toEncryptionMeta(encrypted)
    expect(meta.algorithm).toBe('AES-256-GCM')
    expect(meta.version).toBe(1)
    expect(meta.wrappedKey).toBeNull()
    expect(meta.iv).toBe(bufferToBase64(encrypted.iv))
    expect(meta.encryptedName).toBeTruthy()
    expect(base64ToBytes(meta.iv).length).toBe(12)
  })

  it('uses chunked encryption automatically above 64 MiB threshold', async () => {
    // Avoid allocating 65 MiB: forceChunked exercises the same path.
    const body = new Uint8Array(1000)
    body.fill(7)
    const file = new File([body], 'large.bin')
    const encrypted = await encryptFile(file, 'large.bin', {
      forceChunked: true,
      chunkSize: 300,
    })
    expect(encrypted.version).toBe(2)
    expect(encrypted.chunkCount).toBe(4)
    expect(encrypted.chunkSize).toBe(300)
    expect(encrypted.ciphertext.size).toBe(
      body.byteLength + (encrypted.chunkCount ?? 0) * GCM_TAG_BYTES,
    )
  })

  it('round-trips chunked encryption via metadata envelope', async () => {
    const text = 'chunked-space-storage-' + 'A'.repeat(500)
    const file = new File([text], 'video-like.bin')
    const encrypted = await encryptFileChunked(file, 'video-like.bin', {
      chunkSize: 128,
    })
    const meta = toEncryptionMeta(encrypted)
    expect(meta.version).toBe(2)
    expect(meta.chunkSize).toBe(128)
    expect(meta.chunkCount).toBeGreaterThan(1)
    expect(base64ToBytes(meta.iv).length).toBe(FILE_NONCE_BYTES)

    const plain = await decryptCiphertextBlob(
      encrypted.ciphertext,
      meta,
      encrypted.fileKeyRaw,
    )
    expect(await plain.text()).toBe(text)
  })

  it('chunkIv embeds big-endian index after the file nonce', () => {
    const nonce = new Uint8Array(FILE_NONCE_BYTES).fill(0xab)
    const iv = chunkIv(nonce, 0x01020304)
    expect(iv.byteLength).toBe(12)
    expect(Array.from(iv.slice(0, 8))).toEqual(Array.from(nonce))
    expect(Array.from(iv.slice(8))).toEqual([1, 2, 3, 4])
  })

  it('detects tampering of a middle ciphertext chunk', async () => {
    const file = new File([new Uint8Array(400).fill(1)], 't.bin')
    const encrypted = await encryptFileChunked(file, 't.bin', {
      chunkSize: 100,
    })
    const meta = toEncryptionMeta(encrypted)
    const bytes = new Uint8Array(await encrypted.ciphertext.arrayBuffer())
    // Flip a byte inside the second ciphertext chunk (after first tag).
    const offset = 100 + GCM_TAG_BYTES + 3
    bytes[offset] = (bytes[offset] ?? 0) ^ 0xff
    const tampered = new Blob([bytes])

    await expect(
      decryptCiphertextBlob(tampered, meta, encrypted.fileKeyRaw),
    ).rejects.toThrow(/Decryption failed/)
  })

  it('decryptCiphertextBlob round-trips single-shot meta', async () => {
    const file = new File(['hello vault'], 'h.txt')
    const encrypted = await encryptFile(file, 'h.txt')
    const meta = toEncryptionMeta(encrypted)
    const plain = await decryptCiphertextBlob(
      encrypted.ciphertext,
      meta,
      encrypted.fileKeyRaw,
    )
    expect(await plain.text()).toBe('hello vault')
  })
})
