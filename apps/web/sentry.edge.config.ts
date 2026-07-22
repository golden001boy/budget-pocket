import * as Sentry from '@sentry/nextjs';

// Covers middleware.ts and any route handler forced onto the edge runtime.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
});
