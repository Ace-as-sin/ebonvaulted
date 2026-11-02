# Ebon Vaults

Prelaunch landing page for **Ebon Vaults** — a privacy-focused space storage and backup service. This site validates demand, presents test pricing, and collects an early-access waitlist. It is not a live storage product.

Waitlist emails are intended to be stored only on infrastructure you control. This repo includes a small **home-desktop waitlist server** plus an unlisted `/server-status` page that checks API liveness when the page loads.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Lucide React
- React Router
- Node 20+ home waitlist server (`server/`)

## Local development (website)

<!-- deploy-test: harmless marker for develop push verification -->

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and configure:

| Variable | Purpose |
| --- | --- |
| `VITE_WAITLIST_ENDPOINT` | `POST` URL for waitlist submissions (required for real signups) |
| `VITE_WAITLIST_HEALTH_ENDPOINT` | `GET` URL for token-gated detailed health (`/health`) |
| `VITE_WAITLIST_LIVE_ENDPOINT` | Optional public `GET` liveness URL (`/live`) for `/server-status` on-load checks. If omitted and health ends with `/health`, `…/live` is derived |
| `VITE_ANALYTICS_ENABLED` | Set `true` to emit analytics events |
| `VITE_ANALYTICS_ENDPOINT` | Optional `POST` URL for analytics payloads |

Without `VITE_WAITLIST_ENDPOINT`, the form shows a clear development-mode message and does **not** pretend the signup succeeded.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Oxlint |
| `npm test` | Vitest unit tests |
| `npm run server:start` | Start the home waitlist server |
| `npm run server:dev` | Start the home waitlist server with `--watch` |

## Home desktop waitlist server

The server lives in [`server/`](server/). It:

- Accepts `POST /waitlist` with the same JSON payload the website already sends
- Appends signups to a local JSONL file under `WAITLIST_DATA_DIR` (default `server/data/`)
- Exposes `GET /live` (public, no auth) for automatic uptime checks
- Exposes `GET /health` (Bearer token required) with non-PII stats
- Supports dry-run signup tests via `X-Waitlist-Dry-Run: true` + Bearer token (validates + checks writability, **does not** store the email)

### 1. Configure the server

```bash
cd server
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux
```

Edit `server/.env`:

| Variable | Purpose |
| --- | --- |
| `WAITLIST_STATUS_TOKEN` | Long random secret (min 16 chars). Used for optional detailed `/server-status` checks. **Never** put this in `VITE_*` env vars. |
| `WAITLIST_DATA_DIR` | Folder for `signups.jsonl` + `meta.json` (created automatically) |
| `CORS_ORIGIN` | Comma-separated allowed browser origins (production site + local Vite) |
| `PORT` | Listen port (default `8787`) |
| `HOST` | Bind address (default `127.0.0.1`) |

Generate a token:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Run it on your desktop

```bash
npm run server:start
```

Keep this process running (Task Scheduler / NSSM / pm2 / a always-on terminal are fine). Signups are written only under `WAITLIST_DATA_DIR` on that machine.

### 3. Expose it safely (Cloudflare Tunnel)

Prefer a tunnel over opening router ports:

1. Install [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/).
2. Create a tunnel that forwards HTTPS public hostname → `http://127.0.0.1:8787`.
3. Point website env vars at that hostname, for example:
   - `VITE_WAITLIST_ENDPOINT=https://waitlist.yourdomain.com/waitlist`
   - `VITE_WAITLIST_HEALTH_ENDPOINT=https://waitlist.yourdomain.com/health`
   - `VITE_WAITLIST_LIVE_ENDPOINT=https://waitlist.yourdomain.com/live` (optional if health ends with `/health`)
4. Rebuild / redeploy the Cloudflare Pages site after changing `VITE_*` values.

Ensure `CORS_ORIGIN` on the desktop server includes your production origin (and `http://localhost:5173` while developing).

### 4. Check status from the website

1. Open `https://your-site/server-status` (unlisted — not linked in the public nav/footer).
2. The page checks `GET /live` when it loads (no access key). Use **Check now** to re-run without reloading.
3. Optionally unlock with `WAITLIST_STATUS_TOKEN` for signup counts and a dry-run signup test.

If the live check fails: desktop server down, tunnel down, wrong URL, or `CORS_ORIGIN` mismatch.  
If detailed health fails with unauthorized: wrong access key.  
If dry-run fails after health passes: waitlist route/path mismatch or server not updated.

## Cloudflare Pages

1. Connect this repository (or upload `dist/` after `npm run build`).
2. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** 20+ recommended
3. SPA routing is handled by `public/_redirects` (`/* → /index.html` with 200).
4. Add environment variables in the Pages project settings (same `VITE_*` keys as above). Rebuild after changing them — Vite inlines env at build time.

Replace `https://ebonvaults.com` in `index.html`, `public/robots.txt`, and `public/sitemap.xml` with your real production domain when ready.

## Project layout

```
src/
  components/   Header, Hero, Features, Pricing, Waitlist, calculator, …
  pages/        Home, PricingCalculatorPage, ServerStatusPage, Blog, Privacy, Terms
  lib/          analytics, waitlist, waitlistStatus, pricing, plans
  types/        shared TypeScript types
server/
  src/          Home-desktop waitlist + /live + /health server
  data/         Local signup storage (gitignored)
```

