# Windows deployment guide (Caddy + localhost Fastify)

This guide prepares `https://api.ebonvaults.com` while keeping the Node.js process bound to `127.0.0.1`.

**This document does not open firewall ports or expose the app for you.** You must review and apply each step intentionally.

## Architecture

```
Browser (ebonvaults.com on Netlify)
        │ HTTPS
        ▼
Caddy on your Windows PC  (:443)
        │ reverse_proxy
        ▼
Fastify waitlist API      (127.0.0.1:8787)
        │
        ▼
SQLite file (outside web roots)
```

Keys and backups must live in different locations (for example keys in an encrypted volume, backups on a separate drive or offline media).

## 1. Install prerequisites

- Node.js **22.5+** (uses built-in `node:sqlite`; avoids native `better-sqlite3` builds on Windows)
- [Caddy](https://caddyserver.com/docs/install#windows) for Windows
- Stable hostname strategy (see dynamic IP notes below)

## 2. Create data + key locations

Example layout:

```
C:\ebonvaults-data\
  waitlist.db
  backups\
C:\ebonvaults-secrets\
  .env          (contains EMAIL_* keys only; ACL-restricted)
```

Copy `server\.env.example` to `C:\ebonvaults-secrets\.env`, generate keys with `npm run gen-keys`, and set:

```
HOST=127.0.0.1
PORT=8787
DATABASE_PATH=C:\ebonvaults-data\waitlist.db
BACKUP_DIR=C:\ebonvaults-data\backups
CORS_ORIGINS=https://ebonvaults.com,https://www.ebonvaults.com
EMAIL_ENCRYPTION_KEY=...
EMAIL_HMAC_KEY=...
```

Restrict NTFS permissions on `C:\ebonvaults-secrets` and `C:\ebonvaults-data` to your service account / admin user only.

## 3. Run the API locally first

```powershell
cd D:\Code\ebonvaulted\server
$env:DOTENV_CONFIG_PATH = "C:\ebonvaults-secrets\.env"
# Or place a symlink/copy of .env inside server\ for dotenv default load
npm install
npm test
npm start
```

Confirm:

```powershell
curl.exe http://127.0.0.1:8787/healthz
```

## 4. Caddyfile (HTTPS reverse proxy)

Example `C:\ebonvaults-caddy\Caddyfile`:

```
api.ebonvaults.com {
  encode gzip
  reverse_proxy 127.0.0.1:8787

  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    X-Content-Type-Options nosniff
    Referrer-Policy no-referrer
    -Server
  }

  log {
    output file C:\ebonvaults-data\caddy-access.log
  }
}
```

Start Caddy (elevated if binding :443):

```powershell
caddy run --config C:\ebonvaults-caddy\Caddyfile
```

Caddy will obtain/renew certificates when DNS for `api.ebonvaults.com` points at this host.

## 5. Netlify / DNS

In your DNS provider (often Netlify DNS for `ebonvaults.com`):

1. Create an **A** record: `api` → your public IPv4 address  
   **or** a **CNAME**/dynamic DNS hostname if you use a DDNS provider.
2. Do **not** put the API on the Netlify site host itself.
3. Keep the marketing site on Netlify (`ebonvaults.com`).
4. Set the frontend env var for production builds:

```
VITE_API_URL=https://api.ebonvaults.com
```

Rebuild/redeploy the Netlify site after setting the variable.

## 6. Windows Firewall (manual)

Only after you accept the risk of exposing Caddy:

1. Open **Windows Defender Firewall with Advanced Security**
2. Inbound rule: allow **TCP 443** to the Caddy executable (preferred) or port 443
3. Do **not** allow inbound TCP 8787 from the internet — Fastify must stay localhost-only
4. Prefer allowing only the Caddy program path, not “any”

This repository will not create firewall rules for you.

## 7. Router port forwarding (manual)

If the PC is behind NAT:

1. Forward **WAN TCP 443 → your PC LAN IP:443** (Caddy)
2. Do **not** forward port 8787
3. Give the PC a DHCP reservation so the LAN IP is stable
4. Re-check forwarding after router firmware updates

## 8. Dynamic IP considerations

Home ISPs often change public IPs.

Options:

- Dynamic DNS (DuckDNS, Cloudflare API updater, etc.) pointed at `api.ebonvaults.com`
- Router DDNS feature updating the `api` A record
- Static IP / business internet if available

Caddy certificate issuance requires the hostname to resolve to the machine running Caddy when using HTTP-01 / TLS-ALPN challenges.

## 9. Start after Windows reboot (Task Scheduler)

Create two tasks (At startup / At log on), running whether user is logged on or not if appropriate:

1. **Waitlist API**
   - Program: `npm` or full path to `node`
   - Arguments: `start` with Start in `D:\Code\ebonvaulted\server`
   - Or `tsx src/index.ts` via `npx`
   - Ensure `.env` is available in that working directory

2. **Caddy**
   - Program: `caddy.exe`
   - Arguments: `run --config C:\ebonvaults-caddy\Caddyfile`

Verify after reboot:

```powershell
curl.exe https://api.ebonvaults.com/healthz
```

## 10. Backup & restore

### Backup

```powershell
cd D:\Code\ebonvaulted\server
npm run backup
```

Copy `BACKUP_DIR` artifacts to offline/separate storage. **Do not store the only copy of keys next to the only copy of backups.**

### Restore

1. Stop the API (and optionally Caddy)
2. Replace `DATABASE_PATH` with the chosen `waitlist-*.db` backup
3. Confirm `EMAIL_ENCRYPTION_KEY` / `EMAIL_HMAC_KEY` match the keys used when the backup was written
4. Start the API and run `npm run cli -- count`

If keys are lost, ciphertext cannot be recovered.

## 11. Frontend production checklist

- [ ] `VITE_API_URL=https://api.ebonvaults.com` set in Netlify
- [ ] Site rebuilt after env change
- [ ] CORS includes `https://ebonvaults.com` (and `www` if used)
- [ ] Test a real signup, then `npm run cli -- count` on the PC
- [ ] Confirm duplicates return success without email enumeration

## 12. Ubuntu migration notes (later)

- Keep the same `.env` key material and SQLite file
- Bind Fastify to `127.0.0.1`
- Use Caddy or nginx on the VPS
- Point `api.ebonvaults.com` at the VPS
- Use systemd unit files instead of Task Scheduler
