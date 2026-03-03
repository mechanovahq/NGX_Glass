# NGXGlass — CLAUDE.md

## Project Overview
Single-file HTML dashboard for Nigerian Exchange (NGX) analytics.
- **Main file:** `ngx-dashboard-v1.html` (~3650 lines)
- **No build step, no backend** — everything is self-contained HTML/CSS/JS
- **Contact email:** ngxglass@gmail.com

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

### Key Data
- `STOCKS` — 156 NGX equities (objects with: `sym`, `co`, `sec`, `price`, `day`, `week`, `ytd`, `capN`, `capV`, `vol`, `volV`, `os`, `lo`, `hi`, `div`, `pe`, `up`)
- `BUBBLE_STOCKS` — subset of stocks used for the market-view animated bubble canvas
- `SECTOR_DATA` — 15 sectors with WTD % change, stock count, market cap (used in heatmap tiles)
- `FULL_FILINGS` — 20 corporate filings/disclosures for the Disclosures view
- `FULL_NEWS` — 16 news items with `tag`, `tagLabel`, `tagClass`, `source`, `time` fields
- `earningsCalendar` — upcoming results/AGM/dividend dates

### Auth System
- localStorage-based (`ngxglass-users` = registered accounts, `ngxglass-user` = current session)
- `openLogin(tab)` / `closeLogin()` / `doLogin()` / `doSignup()` / `demoLogin()` / `logoutUser()`
- `updateNavAuth()` — toggles nav between auth buttons and user avatar

### Bubble Canvas
- `drawBubbles()` — animates the market-view bubble canvas (uses global `canvas`, `bubbles`, `animId`)
- `drawBubblesOnCanvas(canvasEl, stockData)` — reusable renderer for the heatmap view canvas
- `setBubbleView(btn, filter)` — filter for market-view bubbles
- `setHeatmapBubbleView(btn, filter)` — filter for heatmap-view bubbles (scoped to `#heatmap-view`)

## CSS Theme
- Dark: `[data-theme="dark"]` (default) — `--bg:#080b0e`, `--surface:#0e1217`
- Light: `[data-theme="light"]` — toggle via the 🌙 icon button
- Accent green: `--accent:#16a34a`, `--accent-light:#22c55e`

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
```

## Editing Guidelines
- **Never add a backend** — keep everything self-contained in the single HTML file
- **Data updates:** Edit the `STOCKS`, `FULL_FILINGS`, `FULL_NEWS`, `SECTOR_DATA` arrays directly
- **New views:** Add HTML block inside `<div class="page">`, add ID to `ALL_VIEWS` array, add `case` in `switchView`, add nav tab with `data-view` attribute
- **Styles:** All CSS is in the `<style>` block in `<head>` — grouped by component with `═══` headers
- **Email:** Always use `ngxglass@gmail.com` for any contact/API references
