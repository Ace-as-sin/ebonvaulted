# Ebon Vaults Waitlist API

Self-hosted waitlist backend (Node.js + Fastify + SQLite). Emails are encrypted at rest with AES-256-GCM. Duplicate detection uses HMAC-SHA256. No plaintext emails are stored in the database.

**Default bind:** `127.0.0.1` only. Public HTTPS should terminate at Caddy (`api.ebonvaults.com`).

## Locally tested vs public-ready

| Capability | Locally tested | Public deployment ready |
| --- | --- | --- |
| `POST /api/waitlist` validation + persistence | Yes (automated tests + manual) | Needs your keys, DNS, Caddy, firewall |
| Duplicate handling without email oracle | Yes | Yes (same code) |
| Encryption / decryption CLI export | Yes | Keep keys offline |
| CORS for `localhost:5173` + `ebonvaults.com` | Yes | Confirm production origins |
| Windows + Caddy reverse proxy | Documented | You must configure host/router |
| Automatic start after reboot | Documented (Task Scheduler) | You must create the task |

Requires **Node.js 22.5+** (uses the built-in `node:sqlite` module — no Visual Studio / node-gyp needed on Windows).

## Quick start (PowerShell)

```powershell
cd D:\Code\ebonvaulted\server
npm install
npm run gen-keys
```

Copy the printed keys into `server\.env` (start from `.env.example`):

```powershell
Copy-Item .env.example .env
# Edit .env and paste EMAIL_ENCRYPTION_KEY + EMAIL_HMAC_KEY
npm test
npm start
```

In another terminal, verify a signup:

```powershell
curl.exe -s -X POST http://127.0.0.1:8787/api/waitlist `
  -H "Content-Type: application/json" `
  -H "Origin: http://localhost:5173" `
  -d "{\"email\":\"you@example.com\",\"plan\":\"plus\",\"intendedUse\":\"personal\",\"privacyFeature\":\"encryption\",\"consent\":true}"

npm run cli -- count
```

## Admin CLI (local only)

```powershell
npm run cli -- count
npm run cli -- by-plan
npm run cli -- by-use
npm run cli -- by-privacy
npm run cli -- export .\exports\waitlist.csv
npm run cli -- delete-email you@example.com
```

## Backups

```powershell
npm run backup
```

Restore: stop the API, replace `DATABASE_PATH` with a backup `.db` file, restart. Keep backups **separate** from encryption keys.

See `docs/DEPLOYMENT-WINDOWS.md` for Caddy, DNS, firewall, and Task Scheduler.
