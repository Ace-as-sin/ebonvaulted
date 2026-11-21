# Ebon Vaults

Prelaunch landing page for **Ebon Vaults** — a privacy-focused space storage and backup service. This site validates demand, presents test pricing, and collects an early-access waitlist. It is not a live storage product.

Production waitlist submissions go through **Netlify Functions** (`/waitlist`). An optional home-desktop waitlist server remains in `server/` for local or self-hosted use.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Lucide React
- React Router
- Netlify Functions for production waitlist
- Optional Node home waitlist server (`server/`)

## Local development (website)

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and configure:

| Variable | Purpose |
| --- | --- |
| `VITE_WAITLIST_ENDPOINT` | `POST` URL for waitlist submissions (required for real signups) |
| `VITE_META_PIXEL_ID` | Meta Pixel ID for landing PageView + waitlist Lead |
| `VITE_ANALYTICS_ENABLED` | Set `true` to emit first-party analytics events |
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
| `npm run server:start` | Start the optional home waitlist server |
| `npm run server:dev` | Start the home waitlist server with `--watch` |

## Netlify (production)

1. Connect this repository.
2. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
3. Site env vars:
   - `VITE_WAITLIST_ENDPOINT=https://ebonvaults.com/waitlist` (or your site `/waitlist`)
   - `VITE_META_PIXEL_ID=<pixel id>`
   - `META_PIXEL_ID=<same pixel id>`
   - `META_CAPI_ACCESS_TOKEN=<Conversions API token>`
4. Rebuild after changing any `VITE_*` value — Vite inlines them at build time.

`netlify.toml` rewrites `/waitlist`, `/live`, and `/health` to the Netlify functions.

## Optional home desktop waitlist server

The server lives in [`server/`](server/). It:

- Accepts `POST /waitlist` with the same JSON payload the website already sends
- Appends signups to a local JSONL file under `WAITLIST_DATA_DIR` (default `server/data/`)
- Exposes `GET /live` (public) and `GET /health` (Bearer token) for ops checks
- Can send Meta CAPI Lead events when `META_PIXEL_ID` + `META_CAPI_ACCESS_TOKEN` are set

```bash
cd server
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux
npm run server:start     # from repo root, or node from server/
```

Keep signup data under `WAITLIST_DATA_DIR` on that machine. Prefer a Cloudflare Tunnel over opening router ports if you expose it.

## Project layout

```
src/
  components/   Header, Hero, Features, Pricing, Waitlist, calculator, …
  pages/        Home, PricingCalculatorPage, Blog, Privacy, Terms
  lib/          analytics, waitlist, metaPixel, pricing, plans
  types/        shared TypeScript types
netlify/
  functions/    Production waitlist + Meta CAPI
server/
  src/          Optional home-desktop waitlist server
  data/         Local signup storage (gitignored)
```
