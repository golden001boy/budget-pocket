# Epic 9 — AI Financial Advisor

**Status**: Partially done — scenario planning is live; conversational chat is
built but disabled.

## Story 9.1 — What-if scenarios

**Status**: Done

**Story**: As a user, I can save named "what-if" planning scenarios (e.g. "what
if I increase rent budget by 20%") tied to my account.

**Acceptance criteria**: `GET/POST /api/advisor/scenarios` on the `Scenario`
model, `ScenarioType` enum for the kind of scenario.

**Implementation**: [apps/web/src/app/api/advisor/scenarios/route.ts](../apps/web/src/app/api/advisor/scenarios/route.ts),
[apps/web/src/components/advisor/ScenarioList.tsx](../apps/web/src/components/advisor/ScenarioList.tsx).

## Story 9.2 — Context builder for grounded AI answers

**Status**: Done (built, not yet wired to a live chat response)

**Story**: As a groundwork requirement for the advisor, the system can assemble
a summary of the user's accounts, transactions, budgets, and goals to give an AI
model real context instead of generic advice.

**Implementation**: [apps/web/src/lib/ai/buildContext.ts](../apps/web/src/lib/ai/buildContext.ts),
provider config in [apps/web/src/lib/ai/client.ts](../apps/web/src/lib/ai/client.ts)
(Groq primary / Anthropic fallback).

## Story 9.3 — Conversational chat endpoint

**Status**: Disabled

**Story**: As a user, I can ask the AI advisor a free-form question about my
finances and get an answer grounded in my own data.

**Current state**: `POST /api/advisor/chat` unconditionally returns
`503 { code: "FEATURE_DISABLED" }` — the route does not call `buildContext` or
any AI provider. `AIConversation`/`AIMessage` models exist in the schema but are
unused by any route today. The mobile Advisor tab and
[apps/web/src/components/advisor/AIChat.tsx](../apps/web/src/components/advisor/AIChat.tsx)
render a chat UI against this disabled endpoint.

**What's missing to close this out**: wire `POST /api/advisor/chat` to call
`buildContext` + the configured AI provider, persist the exchange to
`AIConversation`/`AIMessage`, and flip `NEXT_PUBLIC_ENABLE_AI_ADVISOR` on once a
provider API key is configured.

**Implementation (stub)**: [apps/web/src/app/api/advisor/chat/route.ts](../apps/web/src/app/api/advisor/chat/route.ts),
[apps/web/src/app/(dashboard)/advisor/page.tsx](../apps/web/src/app/(dashboard)/advisor/page.tsx),
[apps/mobile/app/(tabs)/advisor/index.tsx](../apps/mobile/app/(tabs)/advisor/index.tsx).
