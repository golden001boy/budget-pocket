# Epic 13 — Mobile App (Expo/React Native)

**Status**: Done

A companion mobile app that talks to the same web API — no separate backend.

## Story 13.1 — Tab navigation shell

**Status**: Done

**Story**: As a mobile user, I can navigate between Home, Expenses, Investments,
Advisor, and Settings via a bottom tab bar, and I'm redirected to login if I'm
not authenticated.

**Implementation**: [apps/mobile/app/(tabs)/_layout.tsx](../../apps/mobile/app/(tabs)/_layout.tsx),
[apps/mobile/app/_layout.tsx](../../apps/mobile/app/_layout.tsx).

## Story 13.2 — Home / dashboard, Expenses, Investments, Advisor, Settings tabs

**Status**: Done (Advisor tab is UI-complete but calls the disabled chat
endpoint — see Epic 9)

**Implementation**: [apps/mobile/app/(tabs)/index.tsx](../../apps/mobile/app/(tabs)/index.tsx),
[apps/mobile/app/(tabs)/expenses/index.tsx](../../apps/mobile/app/(tabs)/expenses/index.tsx),
[apps/mobile/app/(tabs)/investments/index.tsx](../../apps/mobile/app/(tabs)/investments/index.tsx),
[apps/mobile/app/(tabs)/advisor/index.tsx](../../apps/mobile/app/(tabs)/advisor/index.tsx),
[apps/mobile/app/(tabs)/settings/index.tsx](../../apps/mobile/app/(tabs)/settings/index.tsx).

## Story 13.3 — Add-transaction modal

**Status**: Done

**Story**: As a mobile user, I can quickly log a new transaction from anywhere
in the app via a modal.

**Implementation**: [apps/mobile/app/modals/add-transaction.tsx](../../apps/mobile/app/modals/add-transaction.tsx).

## Story 13.4 — Shared API client

**Status**: Done

**Story**: As a maintainer, mobile screens call typed API functions instead of
hand-rolled fetch calls, sharing request/response typing with the concepts used
on web.

**Implementation**: [packages/api-client/src/](../../packages/api-client/src/)
(one module per resource: accounts, budgets, transactions, portfolio, analysis,
alerts, prices).
