# Epic 10 — Alerts & Notifications

**Status**: Done

## Story 10.1 — In-app alerts

**Status**: Done

**Story**: As a user, I receive alerts (budget threshold crossed, AI
recommendation, etc.) that I can mark as read.

**Acceptance criteria**:
- `Alert` model with `type` (`AlertType`), `severity` (`AlertSeverity`), `title`,
  `body`, `isRead`.
- Budget-threshold alerts are created by `api/cron/alerts` (see Epic 4, Story
  4.2); other alert types can be created directly (e.g. seeded
  `AI_RECOMMENDATION` alerts).

**Implementation**: `Alert` model in [apps/web/prisma/schema.prisma](../../apps/web/prisma/schema.prisma),
[apps/web/src/app/api/cron/alerts/route.ts](../../apps/web/src/app/api/cron/alerts/route.ts).
