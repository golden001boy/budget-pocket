# Epic 13 — Mobile App (Expo/React Native)

**Status**: Done

A companion mobile app that talks to the same web API — no separate backend.

## Story 13.1 — Tab navigation shell

**Status**: Done

**Story**: As a mobile user, I can navigate between Home, Expenses, Investments,
Advisor, and Settings via a bottom tab bar, and I'm redirected to login if I'm
not authenticated.

**Implementation**: [apps/mobile/app/(tabs)/_layout.tsx](../apps/mobile/app/(tabs)/_layout.tsx),
[apps/mobile/app/_layout.tsx](../apps/mobile/app/_layout.tsx).

## Story 13.2 — Home / dashboard, Expenses, Investments, Advisor, Settings tabs

**Status**: Done (Advisor tab is UI-complete but calls the disabled chat
endpoint — see Epic 9)

**Implementation**: [apps/mobile/app/(tabs)/index.tsx](../apps/mobile/app/(tabs)/index.tsx),
[apps/mobile/app/(tabs)/expenses/index.tsx](../apps/mobile/app/(tabs)/expenses/index.tsx),
[apps/mobile/app/(tabs)/investments/index.tsx](../apps/mobile/app/(tabs)/investments/index.tsx),
[apps/mobile/app/(tabs)/advisor/index.tsx](../apps/mobile/app/(tabs)/advisor/index.tsx),
[apps/mobile/app/(tabs)/settings/index.tsx](../apps/mobile/app/(tabs)/settings/index.tsx).

## Story 13.3 — Add-transaction modal

**Status**: Done

**Story**: As a mobile user, I can quickly log a new transaction from anywhere
in the app via a modal.

**Implementation**: [apps/mobile/app/modals/add-transaction.tsx](../apps/mobile/app/modals/add-transaction.tsx).

## Story 13.4 — Shared API client

**Status**: Superseded (2026-09-19) — see below

**Story**: As a maintainer, mobile screens call typed API functions instead of
hand-rolled fetch calls, sharing request/response typing with the concepts used
on web.

**What actually shipped instead**: `packages/api-client` (one module per
resource) was built per this story, but authenticated via an
`Authorization: Bearer` header — incompatible with `getServerSession()`
(NextAuth v4), which only ever reads the session cookie. No mobile screen
ever imported it; every real screen went straight to
[apps/mobile/lib/mfetch.ts](../apps/mobile/lib/mfetch.ts) instead, which
authenticates via the `Cookie` header and actually works. Found as dead
code in a session-15 code review ([03-architecture.md
§13](../docs/03-architecture.md#13-dette-technique-identifiée-non-traitée-signalée-pour-décision)),
confirmed with the user, and deleted along with its sole (also unused)
consumer, `apps/mobile/lib/api.ts`. `mfetch.ts` remains the one real
pattern for mobile API calls — no typed per-resource client exists today;
revisit if that gap is ever felt in practice.
