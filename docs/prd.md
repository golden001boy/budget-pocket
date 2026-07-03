# Budget-Pocket — Product Requirements Document

> **Note on provenance**: this PRD was written retroactively (2026-07-03) against an
> already-implemented codebase, to bring the project's documentation up to BMAD-METHOD
> conventions. Every requirement below is backed by code that exists today; sections
> marked **Stubbed** or **Disabled** call out where the implementation intentionally
> stops short of the requirement, so this document is deliberately not "greener" than
> what the app actually does.

## 1. Product summary

Budget-Pocket is a personal finance tracker for Francophone West Africa (XOF/BRVM
market context), delivered as a Next.js web app and a companion Expo/React Native
mobile app sharing a common domain layer. It covers day-to-day expense tracking,
budgeting, savings goals, an investment portfolio (BRVM equities, crypto, real
estate, bonds), retirement/tax planning, and an AI financial advisor, with a
subscription (Stripe) billing model gating premium features.

## 2. Target users

- Individuals in Côte d'Ivoire / UEMOA-zone countries managing money primarily
  through mobile money (Wave, MTN Mobile Money, Orange Money) and cash, who want a
  single place to see spending, budget by category, and track savings/investment
  goals in XOF.
- A secondary admin persona (internal ops) who monitors user growth and platform
  health via `/admin`.

## 3. Goals

1. Let a user track income/expenses across manually-entered and (eventually)
   synced accounts, categorized for budgeting.
2. Give month-by-month budget visibility with threshold alerts before overspending.
3. Support medium/long-horizon planning: savings goals, retirement, real-estate
   and stock-growth "what-if" simulators, and a BRVM/crypto portfolio tracker with
   live price refresh.
4. Surface an AI advisor that can answer questions grounded in the user's own
   financial data (accounts, transactions, budgets, goals).
5. Monetize via a Stripe subscription (monthly/yearly) that unlocks premium
   capabilities, with a lightweight admin console for oversight.
6. Offer the same core experience on a native mobile app, backed by the same API.

## 4. Non-goals / explicit gaps (as of this writing)

- **Real mobile-money account sync is not implemented.** `WAVE`/`MTN_MONEY`/
  `ORANGE_MONEY` sync providers exist as typed interfaces
  ([apps/web/src/lib/sync/providers/](../apps/web/src/lib/sync/providers/)) but each
  one's `getAccountBalance`/`getTransactions` throws `"...API not yet connected"`
  and `isAvailable()` returns `false`. The feature flag
  `NEXT_PUBLIC_ENABLE_SYNC` defaults to `false`. Only the `MANUAL` provider is
  functional. The Accounts page shows a persistent "coming soon" banner reflecting
  this honestly.
- **The AI advisor chat endpoint is disabled.** `POST /api/advisor/chat`
  unconditionally returns `503 FEATURE_DISABLED`
  ([apps/web/src/app/api/advisor/chat/route.ts](../apps/web/src/app/api/advisor/chat/route.ts)),
  even though the context-building pipeline
  ([apps/web/src/lib/ai/buildContext.ts](../apps/web/src/lib/ai/buildContext.ts)) and a
  provider client config (Groq primary, Anthropic fallback,
  [apps/web/src/lib/ai/client.ts](../apps/web/src/lib/ai/client.ts)) are already built.
  "Scenarios" (what-if planning entries, `/api/advisor/scenarios`) are fully
  functional independent of chat.
- No automated test suite beyond two Playwright e2e specs
  (`apps/web/tests/auth.spec.ts`, `apps/web/tests/golden-path.spec.ts`) — no unit
  tests for simulators, analytics, or API routes.

## 5. Epics

Each epic below is tracked as its own file under [docs/epics/](epics/) with a
per-story breakdown, acceptance criteria, and implementation references. Status
reflects the real state of the code, not aspiration.

| # | Epic | Status |
|---|------|--------|
| 1 | [Authentication & Onboarding](epics/epic-01-auth-onboarding.md) | Done |
| 2 | [Accounts & Money-Provider Linking](epics/epic-02-accounts.md) | Partially done (manual only; sync stubbed) |
| 3 | [Transactions & Expense Tracking](epics/epic-03-transactions.md) | Done |
| 4 | [Budgets & Threshold Alerts](epics/epic-04-budgets.md) | Done |
| 5 | [Financial Goals](epics/epic-05-goals.md) | Done |
| 6 | [Investment Portfolio](epics/epic-06-portfolio.md) | Done |
| 7 | [Retirement & Tax Planning](epics/epic-07-planning.md) | Done |
| 8 | [Financial Analysis & Forecasting](epics/epic-08-analysis.md) | Done |
| 9 | [AI Financial Advisor](epics/epic-09-advisor.md) | Partially done (chat disabled) |
| 10 | [Alerts & Notifications](epics/epic-10-alerts.md) | Done |
| 11 | [Billing & Subscriptions](epics/epic-11-billing.md) | Done |
| 12 | [Admin Console](epics/epic-12-admin.md) | Done |
| 13 | [Mobile App (Expo/React Native)](epics/epic-13-mobile.md) | Done |
| 14 | [Platform, Monorepo & Infra](epics/epic-14-platform.md) | Done |

## 6. Key domain entities

Backed by [apps/web/prisma/schema.prisma](../apps/web/prisma/schema.prisma) (19
models): `User`, `Session`, `Subscription`, `LinkedAccount`, `Transaction`,
`Budget`, `CustomCategory`, `RecurringRule`, `FinancialGoal`, `PortfolioItem`,
`AssetPriceSnapshot`, `Alert`, `AIConversation`, `AIMessage`, `Scenario`,
`MonthlySnapshot`, `RetirementPlan`, `TaxRecord`, `NewsletterSubscriber`.

## 7. Non-functional requirements (as implemented)

- **Currency**: XOF-first (`Currency` enum), amounts stored as `Decimal(18,2)`.
- **Auth**: session-based via NextAuth (web) and a JWT bearer flow for mobile
  (`/api/auth/mobile`), sharing the same `User`/`passwordHash` model.
- **Security headers**: CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy
  set globally in [next.config.mjs](../apps/web/next.config.mjs).
- **Background jobs**: 4 Vercel cron endpoints (price refresh hourly, snapshots
  daily, budget alerts daily, recurring-transaction materialization daily), all
  gated behind a shared-secret `Authorization: Bearer $CRON_SECRET` header.
- **Caching**: Redis (`ioredis`) for hot reads, see
  [apps/web/src/lib/cache.ts](../apps/web/src/lib/cache.ts).
