# Unfinished security-critical integrations

The portal UI exists; these items must be completed before treating the product as production-safe.

1. **Better Auth passkey sign-in / registration** — UI stubs only; wire WebAuthn ceremonies to the Ubuntu API.
2. **Invitation redemption** — backend workflow + frontend completion.
3. **Per-file key wrapping + recovery** — raw keys must not depend on in-memory session store.
4. **Resumable / parallel chunk upload API** — client chunked encryption (v2) exists; multi-GB transfer still uses a single POST.
5. **Production HTTPS + CORS + CSRF** — storage API and `app.ebonvaults.com` / marketing site origins.
6. **Strict Content Security Policy** — especially `connect-src` limited to the storage API.
7. **Session cookie hardening** — `Secure`, `HttpOnly`, `SameSite`, rotation, idle timeout UX.
8. **Server-side ownership checks** — every file id scoped to the authenticated user.
9. **Remove mock paths from any production config** — already gated by `import.meta.env.DEV`; keep it that way.
10. **No third-party analytics on `/app/*`** — Meta Pixel / consent banner skipped; keep it that way.
11. **Independent crypto review** — before any “zero-knowledge” language.
12. **Corrupt ciphertext / quota / 401 handling** — expand automated tests against the real API.
13. **Do not reuse `api.ebonvaults.com`** — waitlist only; storage uses `storage-api.ebonvaults.com`.

Frontend route protection (`RequireAuth`) is **not** security. The API must reject unauthorized access.
