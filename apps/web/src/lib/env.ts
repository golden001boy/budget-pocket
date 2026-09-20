import { z } from 'zod';

// `""` and unset mean the same thing throughout this project's env vars
// (see comment below) — normalize before the inner schema's own checks
// (e.g. `.url()`) run, so a blank value is treated as absent rather than
// failing whatever format check the inner schema applies.
function emptyToUndefined<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((value) => (value === '' ? undefined : value), schema.optional());
}

// Story 15.14 (Gate Phase 6 §9.2.j, "coffre secrets"): the secret *values*
// live in Vercel's encrypted per-environment env vars in production, not in
// a file in this repo (see docs/03-architecture.md ADR-012 for why Vercel's
// built-in vars were chosen over standing up Vault/AWS Secrets Manager for a
// project with no real users yet). This module is the other half of that
// story: validate the *shape* of the environment once at server boot and
// fail loudly with one aggregated error, instead of a required secret being
// silently `undefined` and only surfacing as a confusing failure deep inside
// whichever request handler happens to touch it first.
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url({ message: 'must be a valid Postgres connection string' }),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'must be at least 32 characters — generate with `openssl rand -base64 32`'),
  NEXTAUTH_URL: z.string().url({ message: 'must be a valid URL' }),
  CRON_SECRET: z
    .string()
    .min(16, 'must be at least 16 characters — generate with `openssl rand -hex 32`'),
  // Story 15.32 (MFA): encrypts TOTP secrets at rest (AES-256-GCM,
  // lib/mfaCrypto.ts) — a TOTP secret can't be one-way hashed like a
  // password since verifying a code requires recomputing the HMAC from the
  // raw value, so it needs a reversible encryption key kept outside the DB.
  MFA_ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-f]{64}$/i, 'must be 64 hex characters (32 bytes) — generate with `openssl rand -hex 32`'),

  // Everything below is optional infrastructure the app already degrades
  // gracefully without (Redis fail-open since 15.1/ADR-004, Resend/Sentry
  // no-op since 15.11/15.4). An empty string is treated the same as unset
  // (`emptyToUndefined` below) rather than rejected — that's the existing
  // convention for "not configured yet" throughout this project (e.g.
  // `NEXT_PUBLIC_SENTRY_DSN=""` in .env.example is the documented way to
  // keep Sentry a no-op), not a copy-paste mistake to flag.
  REDIS_URL: emptyToUndefined(z.string().url()),
  STRIPE_SECRET_KEY: emptyToUndefined(z.string()),
  STRIPE_WEBHOOK_SECRET: emptyToUndefined(z.string()),
  STRIPE_PRICE_MONTHLY: emptyToUndefined(z.string()),
  STRIPE_PRICE_YEARLY: emptyToUndefined(z.string()),
  RESEND_API_KEY: emptyToUndefined(z.string()),
  RESEND_FROM: emptyToUndefined(z.string()),
  ANTHROPIC_API_KEY: emptyToUndefined(z.string()),
  GROQ_API_KEY: emptyToUndefined(z.string()),
  COINGECKO_API_KEY: emptyToUndefined(z.string()),
  ALPHA_VANTAGE_API_KEY: emptyToUndefined(z.string()),
  NEXT_PUBLIC_SENTRY_DSN: emptyToUndefined(z.string()),
  SENTRY_ORG: emptyToUndefined(z.string()),
  SENTRY_PROJECT: emptyToUndefined(z.string()),
  SENTRY_AUTH_TOKEN: emptyToUndefined(z.string()),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validates a raw environment source against the schema above. Takes the
 * source as a parameter (defaulting to `process.env`) rather than reading
 * `process.env` directly inside the schema, so unit tests can exercise every
 * branch against synthetic input instead of depending on whatever happens to
 * be set in the real process environment.
 */
export function parseServerEnv(
  source: Record<string, string | undefined> = process.env,
): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Invalid or missing environment variables:\n${issues}\n` +
        'See apps/web/.env.example for the full list and how to generate each value.',
    );
  }
  return result.data;
}

// Called once from instrumentation.ts's register() hook, which Next.js runs
// at actual server boot (dev/start) — not during `next build`, and not
// during `pnpm type-check`/`pnpm test`, neither of which import this file.
export function assertServerEnv(): void {
  parseServerEnv();
}
