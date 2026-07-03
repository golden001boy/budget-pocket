# Epic 1 — Authentication & Onboarding

**Status**: Done

Users can register, log in, and complete a first-run onboarding flow on web; the
mobile app authenticates against the same account via a bearer-token exchange.

## Story 1.1 — Email/password registration

**Status**: Done

**Story**: As a new user, I can create an account with an email and password so I
can start tracking my finances.

**Acceptance criteria**:
- `POST /api/auth/register` validates input and creates a `User` with a bcrypt
  `passwordHash`.
- Duplicate email registration is rejected.

**Implementation**: [apps/web/src/app/api/auth/register/route.ts](../../apps/web/src/app/api/auth/register/route.ts),
[apps/web/src/app/(auth)/register/](../../apps/web/src/app/(auth)/register/).

## Story 1.2 — Web session login (NextAuth)

**Status**: Done

**Story**: As a returning user, I can log in with my credentials and stay signed
in across page loads.

**Acceptance criteria**:
- Credentials provider validates against `User.passwordHash`.
- `jwt`/`session` callbacks propagate `id`, `role`, `currency`, `onboardingDone`
  onto `session.user`.

**Implementation**: [apps/web/src/lib/auth.ts](../../apps/web/src/lib/auth.ts),
[apps/web/src/app/api/auth/[...nextauth]/route.ts](../../apps/web/src/app/api/auth/[...nextauth]/route.ts),
[apps/web/src/types/next-auth.d.ts](../../apps/web/src/types/next-auth.d.ts).

## Story 1.3 — Mobile login (bearer token)

**Status**: Done

**Story**: As a mobile user, I can log in with the same credentials as the web
app and have the app remember me.

**Acceptance criteria**:
- `POST /api/auth/mobile` verifies `passwordHash` and returns a NextAuth-compatible
  encoded JWT plus a user summary.
- The mobile app persists the token via `expo-secure-store` and attaches it as
  `Authorization: Bearer <token>` on subsequent API calls.

**Implementation**: [apps/web/src/app/api/auth/mobile/route.ts](../../apps/web/src/app/api/auth/mobile/route.ts),
[apps/mobile/lib/storage.ts](../../apps/mobile/lib/storage.ts),
[apps/mobile/lib/mfetch.ts](../../apps/mobile/lib/mfetch.ts),
[apps/mobile/contexts/AuthContext.tsx](../../apps/mobile/contexts/AuthContext.tsx),
[apps/mobile/app/(auth)/login.tsx](../../apps/mobile/app/(auth)/login.tsx).

## Story 1.4 — First-run onboarding wizard

**Status**: Done

**Story**: As a newly-registered user, I'm guided through initial setup (currency,
first account, etc.) before landing on the dashboard, and the app remembers I've
completed it.

**Acceptance criteria**:
- `User.onboardingDone` gates whether the onboarding route is shown.
- Wizard is a multi-step client component.

**Implementation**: [apps/web/src/components/onboarding/OnboardingWizard.tsx](../../apps/web/src/components/onboarding/OnboardingWizard.tsx),
[apps/web/src/app/(onboarding)/onboarding/page.tsx](../../apps/web/src/app/(onboarding)/onboarding/page.tsx).
