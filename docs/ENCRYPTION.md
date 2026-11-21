# Client-side encryption

Ebon Vaults encrypts files **in the browser** before upload. Plaintext files and plaintext file keys must never be sent to the storage API.

## Implemented (frontend)

- Algorithm: **AES-256-GCM** via Web Crypto
- 256-bit random key **per file**
- Filename encrypted with the same file key (separate IV)
- Unit tests for round-trip, uniqueness, wrong-key, and chunk tampering
- **Version 1 (≤ 64 MiB):** single-shot encrypt of the whole file; random 12-byte IV
- **Version 2 (> 64 MiB):** chunked encrypt via `Blob.slice` (default **4 MiB** plaintext chunks)

Module: `src/portal/crypto/`

## Chunked construction (version 2)

| Field | Meaning |
| --- | --- |
| `iv` | Base64 **8-byte file nonce** (not a full GCM IV) |
| `chunkSize` | Plaintext bytes per chunk (last chunk may be shorter) |
| `chunkCount` | Number of chunks |
| `plaintextSize` | Original file size |

Per-chunk GCM IV:

```
IV(i) = fileNonce (8 bytes) || uint32_be(i) (4 bytes)
```

Wire ciphertext is the concatenation of each chunk’s GCM output (`plaintextLen + 16` tag bytes). Decryptors slice by `chunkSize` / last-chunk length — they must not treat the blob as one GCM message.

Plaintext is read with `file.slice(start, end)` so large videos are not loaded into one `ArrayBuffer`. Ciphertext is a composed `Blob` of chunk parts for the same reason.

Empty files still produce one authenticated empty chunk.

## Explicitly unfinished

| Topic | Status |
| --- | --- |
| Wrapping per-file keys for the server | Not implemented (`wrappedKey: null`) |
| Cross-device key recovery | Not implemented |
| Passkey / WebAuthn PRF binding | Not implemented |
| Resumable / parallel chunk **upload** API | Not implemented (single POST still used) |
| Account recovery without key loss | Not designed |
| Zero-knowledge marketing claim | **Do not claim** until reviewed |

## Interim key handling

`src/portal/crypto/keyStore.ts` keeps raw per-file keys **in memory for the current tab session** so a user can download/decrypt what they just uploaded.

- Lost on refresh, new browser, or new device
- Never written to `localStorage` or plaintext IndexedDB
- Never logged

This is a development bridge, not a security product feature.

## Backend notes for large files

The portal can encrypt large files client-side today, but upload is still one `POST /api/files/upload`. For multi‑GB media, add a resumable/chunked upload API later (per-chunk or ranged PUT, resume tokens). Encryption chunk boundaries and upload chunk boundaries do not have to match, but both must be documented.

Store and return the full `FileEncryptionMeta` (including v2 fields) with each object.

## Threat notes

- Passkey login ≠ portable file decryption key.
- Server sees ciphertext + metadata envelope only (once wrapping exists, wrapped keys — never raw keys).
- Authenticated encryption (GCM) detects ciphertext tampering per chunk; treat decrypt failures as corruption or wrong key.
- Never reuse a `(fileNonce, chunkIndex)` pair with the same file key.
