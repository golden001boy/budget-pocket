# Epic 14 — Platform, Monorepo & Infra

**Status**: Done

Cross-cutting engineering work that isn't a user-facing feature but underpins
every other epic.

## Story 14.1 — pnpm/Turborepo monorepo setup

**Status**: Done

**Implementation**: [pnpm-workspace.yaml](../pnpm-workspace.yaml),
[turbo.json](../turbo.json), root [package.json](../package.json).

## Story 14.2 — Shared domain package

**Status**: Done

**Story**: As a maintainer, Zod schemas, DTO types, and constants used by both
web and mobile live in one package so the two apps can't silently drift apart on
shape or business rules (categories, currencies, provider names, investment
limits).

**Implementation**: [packages/shared/](../packages/shared/).

## Story 14.3 — Dependency version consistency across apps

**Status**: Done

**Story**: As a maintainer, web (React 18.3) and mobile (React 18.2, pinned by
Expo/RN) can coexist in one workspace without their type packages colliding.

**Acceptance criteria**: root `pnpm.overrides` pins a single
`@types/react`/`@types/react-dom` version workspace-wide; `packageExtensions`
patches `lucide-react`'s peer dependency declaration to match.

**Implementation**: root [package.json](../package.json) `pnpm` block,
[.npmrc](../.npmrc).

## Story 14.4 — Reliable install on a clean machine

**Status**: Done

**Story**: As a maintainer, `pnpm install` on a fresh clone succeeds and leaves
the workspace fully usable (binaries linked, Prisma Client generated) without
manual follow-up steps.

**Acceptance criteria**:
- `pnpm.neverBuiltDependencies: ["react-native-screens"]` prevents that
  package's broken `postinstall` (`bob build && husky install`, which requires
  tooling not present in a normal install) from aborting the whole install
  before `node_modules/.bin` is linked.
- `apps/web`'s `postinstall` script runs `prisma generate` so the Prisma Client
  is never missing/stale — a missing client otherwise silently types
  `PrismaClient` as `any`, masking real type errors and crashing at runtime on
  the first DB call.

**Implementation**: root [package.json](../package.json) `pnpm.neverBuiltDependencies`,
[apps/web/package.json](../apps/web/package.json) `postinstall` script.

## Story 14.5 — Background job scheduling

**Status**: Done

**Implementation**: [apps/web/vercel.json](../apps/web/vercel.json) (4 cron
schedules), each corresponding job under
[apps/web/src/app/api/cron/](../apps/web/src/app/api/cron/).

## Story 14.6 — Database seed script

**Status**: Done

**Story**: As a maintainer, I can populate a fresh database with a realistic
demo account (6 months of transactions, budgets, goals, a 3-position portfolio,
a retirement plan, recurring rules, and an alert) via `pnpm db:seed`.

**Implementation**: [apps/web/scripts/seed.ts](../apps/web/scripts/seed.ts).
