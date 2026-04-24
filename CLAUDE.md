# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nigerian Exchange (NGX) analytics dashboard. Two implementations that must stay in sync:

| | Path | Status |
|---|---|---|
| **Original** | `ngx-dashboard-v1.html` | ~4700-line self-contained HTML/CSS/JS |
| **Next.js app** | `ngx-app/` | Full migration, deploys via **Vercel** |

- **Contact:** ngxglass@gmail.com
- **GitHub:** `mechanovahq/NGX_Glass`
- **Deploy target:** Vercel (`ngx-app/vercel.json`). Do not deploy to Netlify.

---

## Local Development

```bash
# Original HTML
node dev-server.js        # http://localhost:3000 — proxies /api/ngx/ → afx.kwayisi.org

# Next.js app
cd ngx-app
npm run dev               # http://localhost:3000
npm run build             # must pass before deploying
npm run lint
```

---

## Next.js App Architecture (`ngx-app/`)

### Framework
- **Next.js 16.1.6**, App Router, TypeScript, React 19
- **Tailwind v4** — config lives entirely in `app/globals.css` (`@import "tailwindcss"`). No `tailwind.config.ts`.
- Dark mode: `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`.
- **Middleware:** Next.js 16 uses `proxy.ts` (not `middleware.ts`) with an exported function named `proxy`. Do not remove the `await supabase.auth.getUser()` call inside it.
- **Design system:** Tessera-inspired. `--bg #0a0b0d`, `--accent #c9a961` (brass), `--pos #4a9d7c` (teal), `--neg #c5563e` (coral). 0.5px hairline borders, 2px border-radius everywhere.

### Route structure

```
app/
  page.tsx                  ← Public landing page (no auth required)
  layout.tsx                ← Root layout: Providers + Nav only
  (dashboard)/
    layout.tsx              ← Adds MarketBanner + TickerStrip
    market/page.tsx
    heatmap/page.tsx
    disclosures/page.tsx
    portfolio/page.tsx
    news/page.tsx
  api/
    prices/route.ts
    ai/route.ts
    auth/
      signup/route.ts
      login/route.ts
      logout/route.ts
      refresh/route.ts
      reset-password/route.ts
```

The `(dashboard)` route group means MarketBanner and TickerStrip only render on dashboard pages, not on the landing page. Dashboard URL paths are unchanged (`/market`, `/heatmap`, etc.).

### Data flow

1. `app/Providers.tsx` (`'use client'`) wraps everything: `ThemeProvider → StocksProvider → LivePricesBootstrapper`
2. `StocksContext` holds the 156-stock `STOCKS` array in a `useReducer`. `UPDATE_PRICES` merges live data by sym (only mutates `price`, `day`, `up` fields).
3. `useLivePrices` (rendered null by `LivePricesBootstrapper`) polls `/api/prices` via SWR and dispatches `UPDATE_PRICES`.
4. All view components call `useStocks()` to get current data.

### Canvas components

Never use React state for animation data. All three follow the same pattern:
- **`BubbleCanvas`** — `useRef` for `bubbles[]` + `animId`; `useEffect([filter])` re-initialises physics; `useEffect([stocks])` mutates `bubblesRef` in-place.
- **`GrowthChartCanvas`** — `useState<PFTimeframe>` for timeframe; redraws on tf/enriched/theme change.
- **`AllocationChartCanvas`** — `drawAllocationChart()` returns `AllocationSlice[]` used to render the legend outside the canvas.

### Theme

`data-theme="dark"` is set on `<html>` in `app/layout.tsx` as SSR default to prevent flash. Toggle writes to localStorage and sets `data-theme` on `<html>`.

### Logo fallback chain

`StockLogo.tsx`: `ngxpulse → clearbit → google → letter-avatar` via imperative `onError`. Uses `<img>` not `next/image` because of this.  
`lib/canvas/logoCache.ts`: same chain for canvas bubbles via `Image()` objects.

### Key lib files

```
lib/data/stocks.ts          — 156-entry STOCKS array (source of truth)
lib/data/stockDomains.ts    — STOCK_DOMAINS map, NGX_SVG_SYMS set, LOGO_SEC_CLR sector colours
lib/canvas/bubblePhysics.ts — initBubbles(), tickPhysics(), initHeatmapBubbles() — pure TS, no DOM
lib/canvas/bubbleRenderer.ts — canvas draw calls: gradient, border, shine, label, logo
lib/utils/marketTime.ts     — isMarketOpen(), watTimeString(), nextOpenLabel() — pure, no DOM
lib/constants.ts            — SECTOR_COLORS, bubbleColor(pct, alpha), glowColor(pct)
lib/supabase/client.ts      — browser Supabase client (anon key)
lib/supabase/server.ts      — SSR Supabase client (cookie-based)
lib/supabase/admin.ts       — service-role client; ONLY use server-side, never in client components
```

### Auth lib utilities (`lib/auth/`)

- `validation.ts` — `validatePassword()` (8 chars, upper+lower+number+special), `validateEmail()`, `sanitize()`
- `rateLimit.ts` — in-memory rate limiter; upgrade to `@upstash/ratelimit` for multi-instance/serverless
- `audit.ts` — `logAudit()` (fire-and-forget writes to `audit_logs`), `getIP()` from request headers

### API routes

| Route | Notes |
|---|---|
| `GET /api/prices` | GitHub raw URL → local file fallback; 60s cache |
| `POST /api/ai` | Groq llama-3.3-70b primary, claude-haiku-4-5 fallback |
| `POST /api/auth/signup` | Rate-limited (5/hr per IP); validates password policy; generic response on duplicate email |
| `POST /api/auth/login` | Dual rate limit (IP + email); account lockout after 5 failures for 15 min; returns `{ session, user }` |
| `POST /api/auth/logout` | Bearer token required; global session revocation via admin client |
| `POST /api/auth/refresh` | Accepts `{ refresh_token }`, returns new session tokens |
| `POST /api/auth/reset-password` | `{ email }` → sends link; `{ token, password }` → updates password + revokes sessions |

**Login flow in components:** call `/api/auth/login`, then `supabase.auth.setSession({ access_token, refresh_token })` on the browser client to store tokens in cookies for SSR.

### Environment variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # server-only; get from Supabase Dashboard → Settings → API
SITE_URL=                      # used in email redirect links (e.g. https://ngx-app-psi.vercel.app)
GROQ_API_KEY=
ANTHROPIC_API_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` must also be set as a Vercel environment variable — without it the login/logout/reset routes return 500.

---

## Database (`supabase-schema.sql`)

Run in **Supabase Dashboard → SQL Editor**. Uses `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ADD COLUMN IF NOT EXISTS` — safe to re-run on an existing database.

**Tables added in v2** (on top of original `profiles`, `portfolio_holdings`, `price_alerts`, `watchlist`):

| Table | Purpose |
|---|---|
| `roles` | admin · premium · user |
| `permissions` | resource + action pairs |
| `role_permissions` | RBAC junction |
| `user_roles` | User ↔ role junction |
| `sessions` | Refresh-token hash registry for multi-device tracking |
| `audit_logs` | Every auth event logged with IP, user-agent, status |
| `password_reset_tokens` | Hashed tokens, zero client access (service-role only) |

**Three triggers fire on signup:** create profile → assign `user` role → set `updated_at`.

**RLS helper:** `public.user_has_role(role_name text)` — used in all policies that check admin access.

**Schema changes:** Always update `supabase-schema.sql` and re-run in the SQL Editor. Never mutate the DB manually without updating the file.

---

## Live Price Architecture

```
GitHub Actions (cron, every 15min Mon–Fri 09–13 UTC)
  └── Fetches afx.kwayisi.org → parses HTML → data/prices.json
      └── raw.githubusercontent.com/mechanovahq/NGX_Glass/main/data/prices.json
          └── /api/prices → browser
```

**Critical:** afx.kwayisi.org blocks all cloud/CDN IPs. Only GitHub Actions (Azure) and residential IPs can reach it. `data/prices.json` must be committed to GitHub for production prices to work.

**Market hours:** Mon–Fri 10:00–14:30 WAT (UTC+1, no DST). SWR polls every 60s when open, 300s when closed.

---

## Original HTML App (`ngx-dashboard-v1.html`)

All views live inside `<div class="page">`. `switchView(id)` hides all IDs in `ALL_VIEWS`, shows target.

| View ID | Notes |
|---|---|
| `market-view` | Default. Bubble canvas + equities table. |
| `portfolio-view` | localStorage holdings. `canvas._pfData` stores data for timeframe switches. |
| `heatmap-view` | `drawBubblesOnCanvas(canvasEl, data)` is the reusable renderer. |
| `disclosures-view` | Filings list with filter + search. |
| `news-view` | Full news feed with category filters. |

**One-time render guard:** several panels use `if (!el || el.innerHTML) return;` — clear `innerHTML` first if a panel appears blank after a data update.

**When updating prices/dates in the HTML file:**
1. Search `Mar 10, 2026` — update all hardcoded date strings
2. Update `asi-val` span
3. Update market summary paragraph in the News sidebar
4. Update `fxData` array and `FIXED_INCOME` if rates changed

**Adding company logos:** add `sym: "domain.com"` to `STOCK_DOMAINS` in both `ngx-dashboard-v1.html` and `ngx-app/lib/data/stockDomains.ts`.
