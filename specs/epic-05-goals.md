# Epic 5 — Financial Goals

**Status**: Done

## Story 5.1 — Create and track savings goals

**Status**: Done

**Story**: As a user, I can define a financial goal (emergency fund, purchase,
travel, retirement, etc.) with a target amount and deadline, and track my
progress toward it.

**Acceptance criteria**:
- `GET/POST /api/goals` and `GET/PATCH/DELETE /api/goals/[id]`.
- `FinancialGoal.type` covers `SAVINGS`, `DEBT_PAYOFF`, `PURCHASE`,
  `EMERGENCY_FUND`, `RETIREMENT`, `EDUCATION`, `TRAVEL`, `OTHER`.
- `GoalForm` creates/edits a goal; goal cards show `currentAmount` /
  `targetAmount` progress and `status` (`ACTIVE`, etc.).

**Implementation**: [apps/web/src/app/api/goals/route.ts](../apps/web/src/app/api/goals/route.ts),
[apps/web/src/app/api/goals/[id]/route.ts](../apps/web/src/app/api/goals/[id]/route.ts),
[apps/web/src/components/goals/GoalForm.tsx](../apps/web/src/components/goals/GoalForm.tsx).

## Story 5.2 — Goals analysis view

**Status**: Done

**Story**: As a user, I can see all my goals together with progress bars and
projected completion, on a dedicated analysis page.

**Implementation**: [apps/web/src/app/(dashboard)/analysis/goals/page.tsx](../apps/web/src/app/(dashboard)/analysis/goals/page.tsx).
