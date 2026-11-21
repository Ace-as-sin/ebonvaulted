# Storage API requirements (frontend contract)

The customer portal talks to the Ubuntu Fastify storage API — **not** Netlify and **not** `api.ebonvaults.com` (waitlist).

## Hosts

| Environment | Browser calls | Notes |
| --- | --- | --- |
| Local DEV | `/api/*` via Vite proxy → `http://127.0.0.1:8788` | SSH tunnel from Windows to the VM |
| Production | `VITE_STORAGE_API_BASE` e.g. `https://storage-api.ebonvaults.com` | Portal planned at `https://app.ebonvaults.com` |

## Auth (Better Auth)

| Method | Path | Status |
| --- | --- | --- |
| GET | `/api/auth/get-session` | Known |
| POST | `/api/auth/sign-out` | Assumed Better Auth default |
| Passkey sign-in / register | Better Auth passkey routes | **Not finalized** |
| Invitation redeem | TBD | **Not finalized** |

All authenticated calls must use credentialed cookies (`credentials: 'include'`), HTTPS in production, and server-enforced ownership. Frontend route guards are UX only.

## Storage endpoints (planned)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/files` | List current user's files |
| POST | `/api/files/upload` | Accept **encrypted** file + encryption metadata |
| GET | `/api/files/:id` | Download encrypted bytes |
| DELETE | `/api/files/:id` | Delete file (owner only) |
| GET | `/api/storage` | Quota + usage |

### Provisional upload body

`multipart/form-data`:

- `file` — ciphertext blob
- `storedName` — opaque name (no plaintext filename)
- `encryption` — JSON string matching `FileEncryptionMeta` in `src/portal/api/types.ts`
- `contentType` — optional; prefer `application/octet-stream`

### Provisional `FileEncryptionMeta`

Single-shot (files ≤ 64 MiB):

```json
{
  "algorithm": "AES-256-GCM",
  "iv": "<base64 12-byte IV>",
  "version": 1,
  "wrappedKey": null,
  "encryptedName": "<base64 filenameIv || ciphertext>"
}
```

Chunked (files > 64 MiB):

```json
{
  "algorithm": "AES-256-GCM",
  "iv": "<base64 8-byte file nonce>",
  "version": 2,
  "chunkSize": 4194304,
  "chunkCount": 18,
  "plaintextSize": 73400320,
  "wrappedKey": null,
  "encryptedName": "<base64 filenameIv || ciphertext>"
}
```

Ciphertext bytes are a concatenation of per-chunk GCM outputs. See `docs/ENCRYPTION.md`.

**Schemas will change.** Keep the TypeScript types as the living contract and update this doc when the backend lands.

## Backend requirements still needed

1. CORS allowing the portal origin with credentials.
2. Secure session cookies (`Secure`, `HttpOnly`, `SameSite`).
3. CSRF strategy compatible with Better Auth.
4. Per-user authorization on every file id (ignore client-supplied user ids).
5. Quota enforcement on upload.
6. No public/unlisted file URLs.
7. Accept encryption metadata and return it on list/get.
8. Future: resumable/chunked upload API for large files.
9. Future: accept wrapped per-file keys once wrapping is designed.

## Mocks

`VITE_STORAGE_USE_MOCKS=true` works **only** when `import.meta.env.DEV` is true. Production builds never fall back to mocks.
