// Story 15.19 (Gate Phase 6 §9.3, BE-08): centralized, structured logging
// for sensitive actions (login, registration, password reset, email
// verification) — until now scattered as free-form `console.warn` calls in
// a handful of files, or not logged at all in others. This doesn't ship a
// log *sink* (no Sentry/Datadog account available in this project, same
// situation as Sentry-without-a-DSN since 15.4) — it standardizes the
// *shape* so wiring one in later (breadcrumb, structured log drain) is a
// one-line change here instead of hunting down every call site.
export type SensitiveAction =
  | 'login_success'
  | 'login_failure'
  | 'register'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'email_verified'
  | 'email_verification_resent';

export interface SensitiveActionEvent {
  action: SensitiveAction;
  userId?: string;
  email?: string;
  ip?: string;
  reason?: string;
}

export function logSensitiveAction(event: SensitiveActionEvent): void {
  console.log(
    JSON.stringify({
      type: 'audit',
      action: event.action,
      userId: event.userId ?? null,
      email: event.email ?? null,
      ip: event.ip ?? null,
      reason: event.reason ?? null,
      at: new Date().toISOString(),
    }),
  );
}
