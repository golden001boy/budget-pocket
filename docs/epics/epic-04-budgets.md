# Epic 4 — Budgets & Threshold Alerts

**Status**: Done

## Story 4.1 — Monthly per-category budgets

**Status**: Done

**Story**: As a user, I can set a monthly spending limit per category and see
how much I've spent against it so far this month.

**Acceptance criteria**:
- `GET/POST /api/budgets` scoped to the current user and month/year.
- `Budget` is unique on `[userId, category, month, year]` so re-setting a budget
  for the same period updates rather than duplicates.
- `BudgetForm` and the budgets dashboard page show spent-vs-limit per category.

**Implementation**: [apps/web/src/app/api/budgets/route.ts](../../apps/web/src/app/api/budgets/route.ts),
[apps/web/src/components/budgets/BudgetForm.tsx](../../apps/web/src/components/budgets/BudgetForm.tsx),
[apps/web/src/app/(dashboard)/budgets/page.tsx](../../apps/web/src/app/(dashboard)/budgets/page.tsx).

## Story 4.2 — Budget threshold alerts

**Status**: Done

**Story**: As a user, I get notified when my spending in a category approaches
the budget I set for it (`alertAt` percentage), so I can react before going over.

**Acceptance criteria**:
- Each `Budget` carries an optional `alertAt` percentage.
- The daily `api/cron/alerts` job compares current-month spend against each
  budget and creates an `Alert` row when the threshold is crossed.

**Implementation**: [apps/web/src/app/api/cron/alerts/route.ts](../../apps/web/src/app/api/cron/alerts/route.ts).
