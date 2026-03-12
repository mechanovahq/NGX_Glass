# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Single-file HTML dashboard for Nigerian Exchange (NGX) analytics.
- **Main file:** `ngx-dashboard-v1.html` (~4600+ lines)
- **No build step** — everything is self-contained HTML/CSS/JS; open directly in a browser
- **Contact email:** ngxglass@gmail.com (use this for all contact/API references — not the one in `docs/api-reference.md`)
- **Deployed via Netlify** — `netlify.toml` handles routing; serverless functions go in `netlify/functions/`

## Architecture

### Views
All views live inside `<div class="page">`. Switching is handled by `switchView(view)` which hides all views in the `ALL_VIEWS` array, then shows the target.

| View ID | Nav Tab | Notes |
|---|---|---|
| `market-view` | Market (mega menu) | Default view |
| `portfolio-view` | Portfolio Tracker | localStorage-persisted holdings |
| `heatmap-view` | Heatmap | Sector tiles + bubble canvas + tables |
| `disclosures-view` | Disclosures | Filings list with filter + search |
| `news-view` | News | Full news feed with category filters |
| `analysis-view` | Analysis | Stock screener, sector valuation, YTD leaders |
| `delisted-view` | Delisted | Historical registry of delisted/suspended securities |

### Key Data Arrays
- `STOCKS` — 156 NGX equities. Schema in `data/stocks-schema.json`. Fields: `r` (rank), `sym`, `co`, `sec`, `price`, `day`, `week`, `ytd`, `capN`, `capV`, `vol`, `volV`, `os`, `lo`, `hi`, `div`, `pe`, `up`
- `BUBBLE_STOCKS` — subset of STOCKS used for the market-view animated bubble canvas
- `SECTOR_DATA` — 15 sectors with WTD % change, stock count, market cap (used in heatmap tiles)
- `FULL_FILINGS` — corporate filings/disclosures for the Disclosures view
- `FULL_NEWS` — news items with `tag`, `tagLabel`, `tagClass`, `source`, `time` fields
- `earningsCalendar` — upcoming results/AGM/dividend dates
- `DELISTED_STOCKS` — 18 historically delisted/suspended NGX securities (fields: `sym`, `co`, `sec`, `date`, `reason`, `tag`, `note`)
- `STOCK_DOMAINS` — map of `sym → domain` used to load company logos via `https://logo.clearbit.com/{domain}`

### Auth System
- **Primary:** Supabase Auth (`_sb` client, configured via `SUPABASE_URL` + `SUPABASE_KEY` at top of `<script>`)
- **Fallback:** localStorage (`ngxglass-users` = registered accounts, `ngxglass-user` = current session) — used when Supabase is unconfigured
- `doLogin()` / `doSignup()` / `logoutUser()` are async and call Supabase first, falling back to localStorage
- `openLogin(tab)` / `closeLogin()` / `demoLogin()` / `updateNavAuth()` — modal control + nav state
- `_sb.auth.onAuthStateChange` listener syncs UI on session changes

### Logo Rendering Pipeline
`slogo(sym, size)` renders a company logo as an inline HTML string (used throughout all views):
1. Looks up `STOCK_DOMAINS[sym]` for the domain
2. Tries Clearbit logo API: `https://logo.clearbit.com/{domain}`
3. On failure → falls back to Google Favicons: `https://www.google.com/s2/favicons?domain={domain}&sz=128`
4. On second failure → renders a letter-avatar `<div>` using `_LOGO_SEC_CLR[sec]` for the sector colour

`_bubbleLogoCache` / `getBubbleLogo(sym)` / `_drawBubbleLogo(ctx, sym, bx, by, r)` do the same for canvas bubbles.

### Bubble Canvas
- `drawBubbles()` — animates the market-view bubble canvas (uses globals `canvas`, `bubbles`, `animId`)
- `drawBubblesOnCanvas(canvasEl, stockData)` — reusable renderer for the heatmap view canvas
- `setBubbleView(btn, filter)` — filter for market-view bubbles
- `setHeatmapBubbleView(btn, filter)` — filter for heatmap-view bubbles (scoped to `#heatmap-view`)
- `getBubbleLogo(sym)` / `_drawBubbleLogo(ctx, sym, bx, by, r)` — draws company logos inside large bubbles (r≥30) using `_bubbleLogoCache`

## CSS Theme
- Dark: `[data-theme="dark"]` (default) — `--bg:#080b0e`, `--surface:#0e1217`
- Light: `[data-theme="light"]` — toggle via the 🌙 icon button
- Accent green: `--accent:#16a34a`, `--accent-light:#22c55e`
- All CSS is in the `<style>` block in `<head>` — grouped by component with `═══` section headers

## Key Functions Reference
```
switchView(view)         — show a named view, scroll to top
renderPortfolio()        — re-render all portfolio panels
renderHeatmapView()      — populate heatmap sector tiles + tables + bubble canvas
renderDisclosuresView()  — render FULL_FILINGS list + earnings calendar + dividend board
renderNewsView()         — render FULL_NEWS list + trending sidebar
filterDisclosures()      — re-filter disclosures by type + search query
setNewsFilter(btn, tag)  — re-filter news by category tag
showToast(msg)           — show bottom-right toast for 3s
openCS(name, icon)       — open "Coming Soon" modal for unbuilt mega-menu features
renderAnalysisView()     — renders screener + sector valuation + YTD leaders panels
runScreener()            — re-filters STOCKS by sector/P/E/div/YTD/cap inputs in analysis-view
resetScreener()          — clears all screener filters
renderDelistedView()     — renders DELISTED_STOCKS list + summary stats
filterDelisted(btn,type) — re-filters delisted list by reason type
```

## Patterns to Know

### One-time render guard
Several panels only populate once to avoid redundant redraws:
```js
if (!el || el.innerHTML) return;
```
If a panel appears blank after a data update, clear its `innerHTML` first (or call the view's full render function again).

### Data refresh checklist
When updating STOCKS prices or adding new data, also update:
1. The hardcoded date strings in the HTML (search for `Mar 10, 2026` to find all occurrences)
2. The `data-stale-badge` text in `analysis-view` and `delisted-view` HTML
3. The market summary paragraph in the News view sidebar
4. The ASI value in the market header (`asi-val` span)
5. `fxData` array for FX rates, and `FIXED_INCOME` object for T-bill/bond rates

## Editing Guidelines
- **Never add a backend** — keep everything self-contained in the single HTML file (Netlify Functions are the exception for lightweight serverless needs)
- **Data updates:** Edit the `STOCKS`, `FULL_FILINGS`, `FULL_NEWS`, `SECTOR_DATA` arrays directly
- **New views:** Add HTML block inside `<div class="page">`, add ID to `ALL_VIEWS` array, add `case` in `switchView`, add nav tab with `data-view` attribute
- **Adding company logos:** Add `sym: "domain.com"` entry to `STOCK_DOMAINS`
- **Supabase schema changes:** Update `supabase-schema.sql` and run in Supabase SQL Editor (`profiles`, `portfolio_holdings`, `price_alerts`, `watchlist` tables — all with RLS)
