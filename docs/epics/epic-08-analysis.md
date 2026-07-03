# Epic 8 — Financial Analysis & Forecasting

**Status**: Done

## Story 8.1 — Monthly snapshots

**Status**: Done

**Story**: As a user, my income/expenses/savings-rate are pre-computed monthly
so historical trend views load fast instead of re-aggregating raw transactions
every time.

**Acceptance criteria**:
- Daily `api/cron/snapshots` job computes `totalIncome`, `totalExpenses`,
  `totalSavings`, `savingsRate`, and a per-category `categoryBreakdown` for the
  current month and upserts a `MonthlySnapshot`.
- `GET /api/analysis/snapshot` serves the latest snapshot to the client.

**Implementation**: [apps/web/src/app/api/cron/snapshots/route.ts](../../apps/web/src/app/api/cron/snapshots/route.ts),
[apps/web/src/lib/analytics/snapshot.ts](../../apps/web/src/lib/analytics/snapshot.ts),
[apps/web/src/app/api/analysis/snapshot/route.ts](../../apps/web/src/app/api/analysis/snapshot/route.ts).

## Story 8.2 — Spending forecast

**Status**: Done

**Story**: As a user, I can see a forward-looking forecast of my spending based
on historical patterns.

**Implementation**: [apps/web/src/app/api/analysis/forecast/route.ts](../../apps/web/src/app/api/analysis/forecast/route.ts),
[apps/web/src/lib/analytics/forecast.ts](../../apps/web/src/lib/analytics/forecast.ts),
[apps/web/src/components/charts/ForecastChart.tsx](../../apps/web/src/components/charts/ForecastChart.tsx).

## Story 8.3 — Dashboard charts

**Status**: Done

**Story**: As a user, my dashboard visualizes net worth over time, spending
trend, and category breakdown at a glance.

**Implementation**: [apps/web/src/components/charts/NetWorthChart.tsx](../../apps/web/src/components/charts/NetWorthChart.tsx),
[apps/web/src/components/charts/SpendingTrendChart.tsx](../../apps/web/src/components/charts/SpendingTrendChart.tsx),
[apps/web/src/components/charts/CategoryPieChart.tsx](../../apps/web/src/components/charts/CategoryPieChart.tsx),
[apps/web/src/app/(dashboard)/dashboard/page.tsx](../../apps/web/src/app/(dashboard)/dashboard/page.tsx),
[apps/web/src/app/(dashboard)/analysis/page.tsx](../../apps/web/src/app/(dashboard)/analysis/page.tsx).

## Story 8.4 — Mobile home dashboard

**Status**: Done

**Story**: As a mobile user, I see the same monthly snapshot summary on my
phone's home tab.

**Implementation**: [apps/mobile/app/(tabs)/index.tsx](../../apps/mobile/app/(tabs)/index.tsx).
