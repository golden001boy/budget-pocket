# Budget-Pocket — Architecture

> Written retroactively (2026-07-03) against the existing implementation, as part of
> bringing the project's documentation up to BMAD-METHOD conventions. Describes the
> system as it is, not as planned.

## 1. Repository shape

pnpm workspace + Turborepo monorepo ([pnpm-workspace.yaml](../pnpm-workspace.yaml),
[turbo.json](../turbo.json)):

```
apps/
  web/      Next.js 14 (App Router) — the primary product surface
  mobile/   Expo / React Native (Expo Router) — companion mobile app
packages/
  shared/       Zod schemas, DTO types, constants (categories, currencies, theme,
                 providers) shared by both apps
  api-client/   Thin fetch wrapper + typed endpoint functions consumed by mobile
                 (and reusable by web) — one file per resource (accounts, budgets,
                 transactions, portfolio, analysis, alerts, prices)
```

`packages/shared` is the single source of truth for cross-cutting types (e.g.
`PortfolioItemDTO`, `AssetClass`) so web and mobile can't silently drift — see
[packages/shared/src/types/](../packages/shared/src/types/).

## 2. Web app (`apps/web`)

- **Framework**: Next.js 14.2 App Router, TypeScript, Tailwind + a small
  Radix-based UI kit under `src/components/ui/`.
- **Route groups**: `(auth)` for login/register, `(dashboard)` for the
  authenticated product surface, `(onboarding)` for first-run setup, `admin/` for
  the internal console — see [apps/web/src/app/](../apps/web/src/app/).
- **API**: Next.js Route Handlers under `src/app/api/**/route.ts`, one resource
  per folder (accounts, transactions, budgets, goals, portfolio, planning,
  advisor, analysis, prices, stripe, cron, auth). Handlers follow a consistent
  shape: `getServerSession` → 401 if absent → Zod-validate body → Prisma call →
  `NextResponse.json`.
- **Data access**: Prisma Client, singleton pattern to survive Next.js dev hot
  reload ([apps/web/src/lib/prisma.ts](../apps/web/src/lib/prisma.ts)). **The
  generated client is not checked into the repo** (`node_modules/.prisma`) —
  `apps/web/package.json` runs `prisma generate` as a `postinstall` step so it's
  always produced fresh after `pnpm install`.
- **Auth**: NextAuth (Credentials provider) for the web session; a parallel
  `/api/auth/mobile` route independently verifies credentials and hand-encodes a
  compatible JWT for the mobile app to store and send as a bearer token — both
  paths converge on the same `User.passwordHash` and JWT shape
  (`id`, `role`, `currency`, `onboardingDone`), typed via
  [apps/web/src/types/next-auth.d.ts](../apps/web/src/types/next-auth.d.ts).
- **Background jobs**: 4 endpoints under `api/cron/*`, scheduled by
  [vercel.json](../apps/web/vercel.json) (hourly price refresh, daily snapshot
  computation, daily budget-threshold alerts, daily recurring-rule
  materialization). Each checks `Authorization: Bearer $CRON_SECRET` before doing
  anything — there is no other auth on these routes, so `CRON_SECRET` must stay
  private.
- **Caching**: Redis via `ioredis`
  ([apps/web/src/lib/cache.ts](../apps/web/src/lib/cache.ts)) fronts
  frequently-read, slow-to-compute data (e.g. price lookups).
- **External integrations**: Stripe (billing), Resend (email — configured but
  optional), CoinGecko (crypto prices), a BRVM price scraper
  (`src/lib/scrapers/brvm.ts`), Groq/Anthropic (AI advisor context — see gaps in
  the PRD), NextAuth for session management.
- **Build posture**: `next.config.mjs` sets `typescript.ignoreBuildErrors: true`
  and `eslint.ignoreDuringBuilds: true` — production builds are not blocked by
  type or lint errors. `pnpm type-check` (via Turbo, see below) is the actual
  gate for type correctness and should be run in CI even though the build itself
  won't enforce it.

## 3. Mobile app (`apps/mobile`)

- **Framework**: Expo SDK 51, Expo Router (file-based routing under `app/`),
  React Native 0.74, React 18.2.
- **Structure**: `(auth)` group for login, `(tabs)` group for the authenticated
  shell (home/dashboard, expenses, investments, advisor, settings), plus a
  `modals/add-transaction` screen — see
  [apps/mobile/app/](../apps/mobile/app/).
- **API access**: `lib/mfetch.ts` wraps `fetch` with the stored bearer token
  (from `/api/auth/mobile`) and base URL; screens call `@budget-pocket/api-client`
  functions or `mfetchJson` directly against the web app's API routes — the
  mobile app has no backend of its own.
- **Auth storage**: `expo-secure-store` (`lib/storage.ts`) persists the JWT;
  `contexts/AuthContext.tsx` exposes the current user to the tab navigator.
- **Icons**: `lucide-react-native`, matched to the same icon set/version used on
  web (`lucide-react`) for visual parity.

## 4. Data model

PostgreSQL via Prisma ORM, 19 models
([apps/web/prisma/schema.prisma](../apps/web/prisma/schema.prisma)), grouped by
domain:

- **Identity/billing**: `User`, `Session`, `Subscription`
- **Money movement**: `LinkedAccount`, `Transaction`, `RecurringRule`,
  `CustomCategory`
- **Planning**: `Budget`, `FinancialGoal`, `RetirementPlan`, `TaxRecord`,
  `Scenario`
- **Investing**: `PortfolioItem`, `AssetPriceSnapshot`
- **Engagement**: `Alert`, `AIConversation`, `AIMessage`, `MonthlySnapshot`,
  `NewsletterSubscriber`

Monetary fields are `Decimal(18,2)` (never `Float`), and most user-scoped models
carry composite uniqueness constraints (e.g. `Budget` is unique on
`[userId, category, month, year]`) to make upserts safe.

## 5. Build & tooling

- **Package manager**: pnpm 9, with `.npmrc` set to `shamefully-hoist=true` and
  `resolve-peers-from-workspace-root=true` to keep the web (React 18.3) and
  mobile (React 18.2, pinned by Expo/React Native) dependency trees from
  conflicting.
- **Version pinning**: root `package.json` uses `pnpm.overrides` to force a
  single `@types/react`/`@types/react-dom` version (`18.3.1`) across the whole
  workspace — without it, multiple copies resolve and Radix/lucide component
  types break with "cannot be used as a JSX component" errors across the board.
- **`pnpm.neverBuiltDependencies: ["react-native-screens"]`**: that package
  ships a `postinstall` (`bob build && husky install`) meant only for its own
  repo checkout; without the build tooling it needs, that script fails and
  aborts the *entire* `pnpm install` before `node_modules/.bin` gets linked
  (silently breaking `turbo`/`tsc` for every workspace). Blocking its build
  script is required for `pnpm install` to complete on a clean machine.
- **Turborepo**: orchestrates `dev`/`build`/`lint`/`type-check`/`format` across
  workspaces with dependency-aware caching (`turbo.json`).
- **Testing**: Playwright e2e specs in `apps/web/tests/`, run via
  `apps/web/playwright.config.ts`; no unit test runner is wired up despite
  `jest` being a listed devDependency.

## 6. Deployment target

`apps/web/vercel.json` (cron schedules) implies Vercel as the intended host for
the web app; no equivalent deployment config exists yet for the mobile app (no
EAS config committed).
