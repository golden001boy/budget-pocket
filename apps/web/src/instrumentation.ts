// Next.js instrumentation hook — runs once per server/edge runtime at boot,
// before any route handler. This is where Sentry needs to be initialized
// for anything that isn't the browser (see instrumentation-client.ts for
// that side). Sentry.init() is a safe no-op when NEXT_PUBLIC_SENTRY_DSN is
// unset — it just skips setting up a transport, no error, nothing sent.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
