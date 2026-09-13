import * as Sentry from '@sentry/nextjs';

// Next.js instrumentation hook — runs once per server/edge runtime at boot,
// before any route handler. This is where Sentry needs to be initialized
// for anything that isn't the browser (see instrumentation-client.ts for
// that side). Sentry.init() is a safe no-op when NEXT_PUBLIC_SENTRY_DSN is
// unset — it just skips setting up a transport, no error, nothing sent.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Story 15.14: fail fast with one clear, aggregated error if a required
    // secret is missing/malformed, instead of a confusing failure deep
    // inside whichever request handler first touches it. Nodejs runtime
    // only — the edge runtime (middleware) never touches the secrets this
    // checks (DATABASE_URL, Stripe, cron) and shares the same process.env
    // on Vercel regardless, so validating it twice would be redundant.
    const { assertServerEnv } = await import('./lib/env');
    assertServerEnv();
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

// Next.js 15 dedicated hook for errors thrown in nested React Server
// Components, which never reach a route handler's own try/catch. Without
// this, those errors are silently swallowed instead of reaching Sentry.
export const onRequestError = Sentry.captureRequestError;
