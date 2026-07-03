# Epic 3 — Transactions & Expense Tracking

**Status**: Done

## Story 3.1 — CRUD transactions

**Status**: Done

**Story**: As a user, I can record income and expense transactions with a
category, amount, description, and date, and edit or delete them later.

**Acceptance criteria**:
- `GET/POST /api/transactions` (list with pagination via `?limit=`, create).
- `GET/PATCH/DELETE /api/transactions/[id]` for a single transaction.
- `TransactionForm` covers both create and edit.

**Implementation**: [apps/web/src/app/api/transactions/route.ts](../../apps/web/src/app/api/transactions/route.ts),
[apps/web/src/app/api/transactions/[id]/route.ts](../../apps/web/src/app/api/transactions/[id]/route.ts),
[apps/web/src/components/transactions/TransactionForm.tsx](../../apps/web/src/components/transactions/TransactionForm.tsx),
[apps/web/src/app/(dashboard)/expenses/page.tsx](../../apps/web/src/app/(dashboard)/expenses/page.tsx),
[apps/web/src/app/(dashboard)/expenses/new/page.tsx](../../apps/web/src/app/(dashboard)/expenses/new/page.tsx).

## Story 3.2 — Categorization

**Status**: Done

**Story**: As a user, my transactions are categorized (housing, food, transport,
etc.) so spending can be broken down and budgeted per category, with room to
define my own custom categories.

**Acceptance criteria**:
- `ExpenseCategory` enum covers the standard categories; `CustomCategory` model
  allows user-defined ones.
- Category list/labels are centralized in `@budget-pocket/shared` constants, not
  duplicated per app.

**Implementation**: [packages/shared/src/constants/categories.ts](../../packages/shared/src/constants/categories.ts),
`CustomCategory` in [apps/web/prisma/schema.prisma](../../apps/web/prisma/schema.prisma).

## Story 3.3 — Recurring transactions

**Status**: Done

**Story**: As a user, I can define a recurring rule (e.g. monthly rent) and have
matching transactions created automatically on schedule instead of re-entering
them every month.

**Acceptance criteria**:
- `RecurringRule` stores `amount`, `category`, `dayOfMonth`, `startDate`,
  `nextRunAt`, `isActive`.
- The daily `api/cron/recurring` job finds due rules and materializes
  `Transaction` rows, then advances `nextRunAt`.

**Implementation**: [apps/web/src/app/api/cron/recurring/route.ts](../../apps/web/src/app/api/cron/recurring/route.ts).

## Story 3.4 — Mobile expense list

**Status**: Done

**Story**: As a mobile user, I can see my recent transactions in the Expenses
tab.

**Acceptance criteria**: fetches `GET /api/transactions?limit=50` via
`mfetchJson` and renders the list.

**Implementation**: [apps/mobile/app/(tabs)/expenses/index.tsx](../../apps/mobile/app/(tabs)/expenses/index.tsx),
[apps/mobile/app/modals/add-transaction.tsx](../../apps/mobile/app/modals/add-transaction.tsx).
