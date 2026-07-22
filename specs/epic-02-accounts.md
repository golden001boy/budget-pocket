# Epic 2 — Accounts & Money-Provider Linking

**Status**: Partially done — manual accounts are fully functional; automatic
mobile-money sync is stubbed and explicitly disabled.

## Story 2.1 — Manual account management

**Status**: Done

**Story**: As a user, I can add a manually-tracked account (a wallet, bank, or
mobile-money balance I update myself) and see it listed with its balance.

**Acceptance criteria**:
- `GET /api/accounts` lists the current user's `LinkedAccount` rows.
- `LinkAccountForm` creates a `MANUAL` provider account.
- The accounts page shows a running total balance across all accounts.

**Implementation**: [apps/web/src/app/api/accounts/route.ts](../apps/web/src/app/api/accounts/route.ts),
[apps/web/src/components/accounts/LinkAccountForm.tsx](../apps/web/src/components/accounts/LinkAccountForm.tsx),
[apps/web/src/app/(dashboard)/accounts/page.tsx](../apps/web/src/app/(dashboard)/accounts/page.tsx).

## Story 2.2 — Mobile-money provider sync (Wave, MTN, Orange)

**Status**: Stubbed / not implemented

**Story**: As a user, I want Budget-Pocket to automatically pull my balance and
transactions from Wave/MTN Money/Orange Money so I don't have to enter them by
hand.

**Current state**: `FinancialSyncProvider` implementations for `WAVE`,
`MTN_MONEY`, and `ORANGE_MONEY` exist as typed stubs — `isAvailable()` returns
`false` and both `getAccountBalance`/`getTransactions` throw `"...API not yet
connected"`. The `NEXT_PUBLIC_ENABLE_SYNC` feature flag defaults to `false`, and
the Accounts page renders a permanent notice
("Synchronisation automatique bientôt disponible") instead of a working sync
toggle.

**What's missing to close this out**: real API/webhook integration with each
mobile-money provider (or an aggregator), credential storage, and a sync
scheduler (likely another `api/cron/*` job) to periodically pull transactions
into `Transaction` rows tagged with the originating `source`.

**Implementation (stub)**: [apps/web/src/lib/sync/providers/](../apps/web/src/lib/sync/providers/)
(`wave.ts`, `mtn.ts`, `orange.ts`, `manual.ts`, `index.ts`).
