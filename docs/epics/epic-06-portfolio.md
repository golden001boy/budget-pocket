# Epic 6 — Investment Portfolio

**Status**: Done

## Story 6.1 — Track portfolio positions

**Status**: Done

**Story**: As a user, I can record what I own (BRVM stocks, crypto, real estate,
bonds, savings accounts) with quantity and average cost, so I can see my total
invested value.

**Acceptance criteria**:
- `GET/POST /api/portfolio` on `PortfolioItem`, keyed by `assetClass`, `ticker`,
  `quantity`, `averageCost`, `currentPrice`.
- `AddPortfolioItemForm` and the investments dashboard page list positions with
  cost basis and current value (`quantity × currentPrice`, falling back to
  `averageCost` when no price has been fetched yet).

**Implementation**: [apps/web/src/app/api/portfolio/route.ts](../../apps/web/src/app/api/portfolio/route.ts),
[apps/web/src/components/investments/AddPortfolioItemForm.tsx](../../apps/web/src/components/investments/AddPortfolioItemForm.tsx),
[apps/web/src/app/(dashboard)/investments/page.tsx](../../apps/web/src/app/(dashboard)/investments/page.tsx),
[packages/shared/src/types/portfolio.ts](../../packages/shared/src/types/portfolio.ts).

## Story 6.2 — Live price refresh (crypto & BRVM)

**Status**: Done

**Story**: As a user, my portfolio's current value reflects up-to-date market
prices without me having to enter them manually.

**Acceptance criteria**:
- Hourly `api/cron/refresh-prices` job fetches crypto prices from CoinGecko and
  BRVM equity prices via a scraper, writing `AssetPriceSnapshot` rows and
  updating `PortfolioItem.currentPrice`/`priceUpdatedAt`.

**Implementation**: [apps/web/src/app/api/cron/refresh-prices/route.ts](../../apps/web/src/app/api/cron/refresh-prices/route.ts),
[apps/web/src/lib/market-data/coingecko.ts](../../apps/web/src/lib/market-data/coingecko.ts),
[apps/web/src/lib/scrapers/brvm.ts](../../apps/web/src/lib/scrapers/brvm.ts),
[apps/web/src/app/api/prices/brvm/route.ts](../../apps/web/src/app/api/prices/brvm/route.ts),
[apps/web/src/app/api/prices/crypto/route.ts](../../apps/web/src/app/api/prices/crypto/route.ts).

## Story 6.3 — Portfolio allocation chart

**Status**: Done

**Story**: As a user, I can see my portfolio's allocation across asset classes
visually.

**Implementation**: [apps/web/src/components/charts/PortfolioAllocationChart.tsx](../../apps/web/src/components/charts/PortfolioAllocationChart.tsx).

## Story 6.4 — Mobile portfolio view

**Status**: Done

**Story**: As a mobile user, I can see my total portfolio value, gain/loss, and
individual positions in the Investments tab.

**Implementation**: [apps/mobile/app/(tabs)/investments/index.tsx](../../apps/mobile/app/(tabs)/investments/index.tsx).
