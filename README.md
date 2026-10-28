# Ebon Vaults

Prelaunch landing page for **Ebon Vaults** — a privacy-focused cloud storage and backup service. This site validates demand, presents test pricing, and collects an early-access waitlist. It is not a live storage product.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Lucide React
- React Router

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and configure:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Waitlist API base URL (e.g. `http://127.0.0.1:8787` or `https://api.ebonvaults.com`) |
| `VITE_ANALYTICS_ENABLED` | Set `true` to emit analytics events |
| `VITE_ANALYTICS_ENDPOINT` | Optional `POST` URL for analytics payloads |

Without `VITE_API_URL`, the form does **not** pretend a signup succeeded.

### Self-hosted waitlist API

The Node/Fastify/SQLite backend lives in [`server/`](./server/). Emails are encrypted at rest (AES-256-GCM); the process binds to `127.0.0.1` by default. See [`server/README.md`](./server/README.md) and [`server/docs/DEPLOYMENT-WINDOWS.md`](./server/docs/DEPLOYMENT-WINDOWS.md).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Oxlint |

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
src/            React landing site
server/         Self-hosted waitlist API + local admin CLI
```
