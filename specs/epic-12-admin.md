# Epic 12 — Admin Console

**Status**: Done

## Story 12.1 — Platform metrics dashboard

**Status**: Done

**Story**: As an admin, I can see aggregate platform health (total users,
premium users, new signups this month, transaction volume) at a glance.

**Acceptance criteria**:
- Route is server-rendered and gated by `session.user.role !== 'ADMIN'` →
  redirect.
- Metrics are computed via parallel Prisma aggregate queries
  (`Promise.all([...counts])`).

**Implementation**: [apps/web/src/app/admin/page.tsx](../apps/web/src/app/admin/page.tsx),
[apps/web/src/app/admin/layout.tsx](../apps/web/src/app/admin/layout.tsx).

## Story 12.2 — User list & management

**Status**: Done

**Story**: As an admin, I can browse the full user list to investigate accounts.

**Implementation**: [apps/web/src/app/admin/users/page.tsx](../apps/web/src/app/admin/users/page.tsx).
