# NGXGlass API Reference

> **Status:** Planned — not yet publicly available.
> Contact: developers@ngxglass.com

---

## Overview

The NGXGlass REST API will provide programmatic access to NGX market data, indices, and analytics. All responses are JSON. Rate limiting applies per API key.

**Base URL:** `https://api.ngxglass.com/v1`

---

## Endpoints (Planned)

### Market Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stocks` | All listed NGX equities with prices |
| `GET` | `/stocks/{symbol}` | Single stock detail |
| `GET` | `/stocks/{symbol}/history` | Historical OHLCV data |
| `GET` | `/indices` | All NGX indices |
| `GET` | `/movers/gainers` | Top gaining stocks |
| `GET` | `/movers/losers` | Top losing stocks |
| `GET` | `/movers/active` | Most active by volume |

### FX & Macro

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/fx` | FX rates (USD, EUR, GBP vs NGN) |
| `GET` | `/macro` | CBN rates, inflation, MPR |

### Market Intelligence

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/breadth` | Market advance/decline data |
| `GET` | `/sectors` | Sector performance summary |
| `GET` | `/filings` | Recent corporate disclosures |
| `GET` | `/news` | Market news feed |

---

## Example Response — `/stocks/ZENITHBANK`

```json
{
  "sym": "ZENITHBANK",
  "co": "Zenith Bank Plc",
  "sec": "Banking",
  "price": 61.80,
  "day": 6.27,
  "week": 14.89,
  "ytd": 14.89,
  "marketCap": "₦2.93T",
  "volume": "79.4M",
  "52wLow": 45.50,
  "52wHigh": 64.00,
  "divYield": 7.4,
  "pe": 3.8,
  "timestamp": "2026-02-27T16:30:00+01:00"
}
```

---

## Authentication

All API calls require an `Authorization: Bearer <token>` header.

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.ngxglass.com/v1/stocks
```

---

## Data Sources

- **Prices & Volume:** Nigerian Exchange Group (NGX) official feed
- **FX Rates:** CBN official rates + FMDQ OTC
- **Corporate Filings:** NGX Issuer Portal / SEC EDGAR-NG
- **Indices:** NGX Index Management
