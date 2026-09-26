import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { PayloadTooLargeError } from '@/lib/requestBody';

// Story 15.31 (03-architecture.md §13, discovery 4): the session check,
// the mutation rate limit, and the try/catch → 500 fallback used to be
// hand-copied into ~21 handlers across ~13 route files — a duplication
// that had already produced two real divergences (a missing try/catch, a
// non-uniform 401 message) by the time a code review caught them. This
// wrapper is the single place that logic now lives; individual routes
// only implement what's actually specific to them.
//
// Two entry points, not one polymorphic one: Next.js's own generated
// per-route type check (.next/types/app/api/**/route.ts) requires an
// exported handler's second parameter, when declared, to be exactly
// `{ params: Promise<P> }` with no `undefined` in the type — which rules
// out an optional-or-defaulted second parameter meant to cover both
// static and dynamic routes in one signature (TypeScript always types an
// optional/defaulted parameter as `X | undefined` via `Parameters<>`).
// A route with no dynamic segments instead gets a returned function with
// only ONE declared parameter — genuinely absent, not optional — which
// satisfies Next's interface through ordinary arity subtyping (a function
// can always be called with more arguments than it declares).

interface WithApiRouteOptions {
  /** Log tag on an unhandled error, e.g. '[budgets:POST]' — matches the pre-existing console.error convention. */
  name: string;
  /** Per-user mutation rate limit (story 15.20). Omit for read-only (GET) handlers. */
  rateLimit?: boolean;
}

async function checkAuthAndRateLimit(options: WithApiRouteOptions): Promise<
  { ok: true; session: Session } | { ok: false; response: Response }
> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (options.rateLimit) {
    const limit = await checkMutationRateLimit(session.user.id);
    if (!limit.success) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard' }, { status: 429 }),
      };
    }
  }

  return { ok: true, session };
}

function handleError(error: unknown, options: WithApiRouteOptions): Response {
  if (error instanceof PayloadTooLargeError) {
    return NextResponse.json({ error: 'Corps de requête trop volumineux' }, { status: 413 });
  }
  console.error(`[${options.name}]`, error);
  return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
}

/** For routes with no dynamic segments (e.g. `/api/budgets`). */
export function withApiRoute(
  handler: (req: Request, ctx: { session: Session }) => Promise<Response>,
  options: WithApiRouteOptions,
) {
  return async (req: Request): Promise<Response> => {
    try {
      const auth = await checkAuthAndRateLimit(options);
      if (!auth.ok) return auth.response;
      return await handler(req, { session: auth.session });
    } catch (error) {
      return handleError(error, options);
    }
  };
}

/** For routes with a dynamic segment (e.g. `/api/transactions/[id]`). */
export function withDynamicApiRoute<P>(
  handler: (req: Request, ctx: { session: Session; params: P }) => Promise<Response>,
  options: WithApiRouteOptions,
) {
  return async (req: Request, routeCtx: { params: Promise<P> }): Promise<Response> => {
    try {
      const auth = await checkAuthAndRateLimit(options);
      if (!auth.ok) return auth.response;
      const params = await routeCtx.params;
      return await handler(req, { session: auth.session, params });
    } catch (error) {
      return handleError(error, options);
    }
  };
}
