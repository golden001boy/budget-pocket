# Epic 7 — Retirement & Tax Planning

**Status**: Done

## Story 7.1 — Retirement plan & projection

**Status**: Done

**Story**: As a user, I can enter my current age, target retirement age, current
savings, monthly contribution, and expected return, and see a projection of
whether I'm on track.

**Acceptance criteria**:
- `GET/PUT /api/planning/retirement` reads/writes the user's single
  `RetirementPlan` (unique on `userId`).
- `computeRetirementProjection`-style logic lives in a dedicated simulator, not
  inline in the route handler.

**Implementation**: [apps/web/src/app/api/planning/retirement/route.ts](../apps/web/src/app/api/planning/retirement/route.ts),
[apps/web/src/lib/simulators/retirement.ts](../apps/web/src/lib/simulators/retirement.ts),
[apps/web/src/components/planning/RetirementPlanForm.tsx](../apps/web/src/components/planning/RetirementPlanForm.tsx).

## Story 7.2 — Tax records

**Status**: Done

**Story**: As a user, I can log tax-relevant records for a given year.

**Implementation**: [apps/web/src/app/api/planning/taxes/route.ts](../apps/web/src/app/api/planning/taxes/route.ts),
[apps/web/src/components/planning/TaxRecordForm.tsx](../apps/web/src/components/planning/TaxRecordForm.tsx).

## Story 7.3 — Real estate & stock growth simulators

**Status**: Done

**Story**: As a user, I can run "what-if" simulations for a real-estate purchase
or a stock/investment growth scenario without them affecting my real financial
data, to inform planning decisions.

**Implementation**: [apps/web/src/lib/simulators/realEstate.ts](../apps/web/src/lib/simulators/realEstate.ts),
[apps/web/src/lib/simulators/stockGrowth.ts](../apps/web/src/lib/simulators/stockGrowth.ts),
surfaced via the `Scenario` model and `/api/advisor/scenarios` (see Epic 9).

## Story 7.4 — Planning dashboard page

**Status**: Done

**Implementation**: [apps/web/src/app/(dashboard)/planning/page.tsx](../apps/web/src/app/(dashboard)/planning/page.tsx).
