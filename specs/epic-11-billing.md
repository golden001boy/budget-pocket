# Epic 11 — Billing & Subscriptions

**Status**: Done

## Story 11.1 — Stripe checkout & premium upgrade

**Status**: Done

**Story**: As a free user, I can start a Stripe Checkout session for a monthly or
yearly plan and become a `PREMIUM` user once payment completes.

**Acceptance criteria**:
- `POST /api/stripe/checkout` creates a Checkout Session with
  `client_reference_id` set to the user id.
- `POST /api/stripe/webhook` handles `checkout.session.completed` (and related
  subscription lifecycle events), creating/updating a `Subscription` row and the
  user's `role`.
- The billing settings page lists premium features and plan pricing.

**Implementation**: [apps/web/src/app/api/stripe/checkout/route.ts](../apps/web/src/app/api/stripe/checkout/route.ts),
[apps/web/src/app/api/stripe/webhook/route.ts](../apps/web/src/app/api/stripe/webhook/route.ts),
[apps/web/src/app/(dashboard)/settings/billing/page.tsx](../apps/web/src/app/(dashboard)/settings/billing/page.tsx),
`Subscription` model in [apps/web/prisma/schema.prisma](../apps/web/prisma/schema.prisma).

## Story 11.2 — Billing portal

**Status**: Done

**Story**: As a premium user, I can manage or cancel my subscription via
Stripe's hosted billing portal.

**Implementation**: [apps/web/src/app/api/stripe/portal/route.ts](../apps/web/src/app/api/stripe/portal/route.ts).

## Story 11.3 — Profile settings

**Status**: Done

**Story**: As a user, I can update my name, currency, and timezone.

**Implementation**: [apps/web/src/app/api/user/profile/route.ts](../apps/web/src/app/api/user/profile/route.ts),
[apps/web/src/components/settings/ProfileForm.tsx](../apps/web/src/components/settings/ProfileForm.tsx),
[apps/web/src/app/(dashboard)/settings/page.tsx](../apps/web/src/app/(dashboard)/settings/page.tsx).
