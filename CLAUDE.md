# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nigerian Exchange (NGX) analytics dashboard. The repository contains two implementations that must stay in sync:

| | Path | Status |
|---|---|---|
| **Original** | `ngx-dashboard-v1.html` | ~4700-line self-contained HTML/CSS/JS, live in production |
| **Next.js app** | `ngx-app/` | Full migration, same feature set, deploys via **Vercel** |

- **Contact email:** ngxglass@gmail.com
- **GitHub remote:** `mechanovahq/NGX_Glass`
- **Deploy target:** Vercel (`ngx-app/vercel.json`). Do not deploy to Netlify.

---

## Local Development

### Original HTML file
```bash
node dev-server.js        # serves at http://localhost:3000
```
`dev-server.js` has no npm dependencies. It proxies `/api/ngx/` → `afx.kwayisi.org` for live prices.

### Next.js app
```bash
cd ngx-app
npm run dev               # http://localhost:3000 (or next available port)
npm run build             # production build, must pass before deploying
npm run lint              # eslint
```

---

## Live Price Architecture

```
GitHub Actions (cron, every 15min Mon–Fri 09–13 UTC)
  └── Fetches afx.kwayisi.org → parses HTML → data/prices.json
      └── raw.githubusercontent.com/mechanovahq/NGX_Glass/main/data/prices.json
          └── /api/prices (Next.js route / Netlify edge function) → browser
```

**Critical constraint:** afx.kwayisi.org blocks all cloud/CDN IPs. Only GitHub Actions (Azure) and residential IPs can reach it. This chain is the only viable free approach.

**Local fallback:** `app/api/prices/route.ts` tries the raw GitHub URL first, then falls back to reading `../data/prices.json` from the local filesystem. This means `data/prices.json` must be pushed to GitHub for production prices to work.

**Market hours:** Mon–Fri 10:00–14:30 WAT (UTC+1, no DST). SWR polls every 60s when open, 300s when closed.

---

## Next.js App Architecture (`ngx-app/`)

### Framework specifics
- **Next.js 16.1.6**, App Router, TypeScript, React 19
- **Tailwind v4** — configured entirely in `app/globals.css` via `@import "tailwindcss"`. No `tailwind.config.ts`. Dark mode uses `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`.
- **Middleware convention**: Next.js 16 uses `proxy.ts` (not `middleware.ts`) with exported function named `proxy`.
- **Design system:** Tessera-inspired. Fonts: Inter (sans) + JetBrains Mono (data/labels) + Georgia fallback for display. Colors: `--bg #0a0b0d`, `--accent #c9a961` (brass), `--pos #4a9d7c` (teal), `--neg #c5563e` (coral). All borders are 0.5px hairline. Border-radius: 2px flat everywhere.

### Data flow
1. `app/Providers.tsx` (`'use client'`) wraps the whole app: `ThemeProvider → StocksProvider → LivePricesBootstrapper`
2. `StocksContext` holds the 156-stock `STOCKS` array in a `useReducer`. `UPDATE_PRICES` merges live data by sym (only updates `price`, `day`, `up` fields).
3. `useLivePrices` (called by `LivePricesBootstrapper`, renders null) polls `/api/prices` via SWR and dispatches `UPDATE_PRICES`.
4. All view components call `useStocks()` to get the latest stock data.

### Canvas components
All three canvas components follow the same pattern — never use React state for animation data:
- **`BubbleCanvas`** — `useRef` for `bubbles[]` array + `animId`; `useEffect([filter])` re-initialises physics; price changes from `useEffect([stocks])` mutate `bubblesRef` in-place without re-render.
- **`GrowthChartCanvas`** — `useState<PFTimeframe>` for timeframe selector; redraws on tf/enriched/theme change.
- **`AllocationChartCanvas`** — returns `AllocationSlice[]` from `drawAllocationChart()` to render the legend outside the canvas.

### Theme
- Dark (default): `:root` CSS variables — `--bg:#080b0e`, `--surface:#0e1217`, `--accent:#16a34a`
- Light: `[data-theme="light"]` overrides. Toggle writes to localStorage + sets `data-theme` on `<html>`.
- `data-theme="dark"` is set on `<html>` in `app/layout.tsx` as the SSR default to prevent flash.

### Auth
`proxy.ts` refreshes Supabase sessions on every request. Auth components use the browser Supabase client from `lib/supabase/client.ts`. Do not remove the `await supabase.auth.getUser()` call in `proxy.ts`.

### Logo fallback chain
`StockLogo.tsx` advances through stages on `onError`: `ngxpulse → clearbit → google → letter-avatar`. Uses `<img>` (not `next/image`) because the fallback chain requires imperative `onError` handling.

`lib/canvas/logoCache.ts` implements the same chain for canvas bubble rendering via `Image()` objects.

### Key lib files
- `lib/data/stocks.ts` — 156-entry `STOCKS` array (source of truth for all views)
- `lib/data/stockDomains.ts` — `STOCK_DOMAINS` map (`sym → domain`), `NGX_SVG_SYMS` set, `LOGO_SEC_CLR` sector colours
- `lib/canvas/bubblePhysics.ts` — pure TS: `initBubbles()`, `tickPhysics()`, `initHeatmapBubbles()` — no DOM
- `lib/canvas/bubbleRenderer.ts` — canvas draw calls: radial gradient, border, shine, label, logo
- `lib/utils/marketTime.ts` — `isMarketOpen()`, `watTimeString()`, `nextOpenLabel()` — pure functions, no DOM
- `lib/constants.ts` — `SECTOR_COLORS`, `bubbleColor(pct, alpha)`, `glowColor(pct)`

### API routes
- `GET /api/prices` — GitHub raw URL with local file fallback; 60s cache
- `POST /api/ai` — Groq (llama-3.3-70b-versatile) primary, Anthropic claude-haiku-4-5 fallback

### Environment variables (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GROQ_API_KEY=          # primary for /api/ai
ANTHROPIC_API_KEY=     # fallback for /api/ai
```

---

## Original HTML App Architecture (`ngx-dashboard-v1.html`)

All views live inside `<div class="page">`. `switchView(id)` hides all IDs in `ALL_VIEWS`, then shows the target.

| View ID | Notes |
|---|---|
| `market-view` | Default. Bubble canvas + equities table. |
| `portfolio-view` | localStorage holdings. Canvas growth chart; `canvas._pfData` stores data for timeframe switches. |
| `heatmap-view` | Sector tiles + bubble canvas. `drawBubblesOnCanvas(canvasEl, data)` is the reusable renderer. |
| `disclosures-view` | Filings list with filter + search. |
| `news-view` | Full news feed with category filters. |

### Key data arrays (all in the HTML `<script>` block)
- `STOCKS` — 156 equities; `price` and `day` mutated in-place by `fetchLivePrices()`
- `BUBBLE_STOCKS` — subset for market bubble canvas; also mutated by `fetchLivePrices()`
- `SECTOR_DATA`, `FULL_FILINGS`, `FULL_NEWS`, `earningsCalendar`, `STOCK_DOMAINS`

### Live prices (HTML version)
`fetchLivePrices()` detects `localhost` vs production:
- **localhost** → `_fetchAFXDirect()` proxied through `dev-server.js`
- **production** → `/api/prices` (Netlify edge function at `netlify/edge-functions/prices.js`)

After updating prices, it calls `renderTable()`, `renderMovers()`, `renderFI()`, `renderPortfolio()`.

### One-time render guard
Several panels populate only once:
```js
if (!el || el.innerHTML) return;
```
Clear `innerHTML` first if a panel appears blank after a data update.

### Data refresh checklist
When updating STOCKS prices or dates in the HTML file:
1. Search `Mar 10, 2026` — update all hardcoded date strings
2. Update `asi-val` span (ASI index value)
3. Update the market summary paragraph in the News view sidebar
4. Update `fxData` array and `FIXED_INCOME` object if rates changed

### Adding / editing data
- **Company logos:** Add `sym: "domain.com"` to `STOCK_DOMAINS` (both `ngx-dashboard-v1.html` and `ngx-app/lib/data/stockDomains.ts`)
- **New view (HTML):** Add HTML inside `<div class="page">`, add ID to `ALL_VIEWS`, add `case` in `switchView`, add nav tab with `data-view` attribute
- **Supabase schema changes:** Update `supabase-schema.sql` and run in Supabase SQL Editor. Tables: `profiles`, `portfolio_holdings`, `price_alerts`, `watchlist` — all with RLS.
