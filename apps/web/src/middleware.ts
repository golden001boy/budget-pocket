import { withAuth } from 'next-auth/middleware';
import type { NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Exported separately from the withAuth() wrapper below so it can be unit
// tested directly, without needing a real getToken()/NEXTAUTH_SECRET round
// trip (see middleware.test.ts).
export function authMiddleware(req: NextRequestWithAuth) {
  const { pathname } = req.nextUrl;
  const token = req.nextauth.token;
  const isApiRoute = pathname.startsWith('/api/');

  // Story 15.21 (noted as a gap since story 15.2, never turned into a
  // story until now): withAuth's own unauthorized handling (driven by the
  // `authorized` callback below) always 307-redirects to /login, even for
  // /api/* routes — a real problem for any JSON API client (mobile, or a
  // future one) that can't sensibly follow an HTML redirect and gets a
  // confusing non-JSON response instead of a clean 401. Handled here
  // instead, where the response can be shaped per route type; `authorized`
  // is set to always return true below so this is the only place that
  // decides what an unauthenticated request gets back.
  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Same shape as withAuth's own default redirect (signIn page +
    // ?callbackUrl=<original>), reproduced manually since taking over the
    // unauthenticated branch here means that default no longer runs.
    const signInUrl = new URL('/login', req.url);
    signInUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to onboarding if not done
  if (
    !token.onboardingDone &&
    pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/onboarding')
  ) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // Admin guard
  if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export default withAuth(authMiddleware, {
  callbacks: {
    // Always true: the unauthenticated case is fully handled inside
    // authMiddleware above (401 JSON for /api/*, redirect for pages)
    // instead of withAuth's single hardcoded redirect-everything default.
    authorized: () => true,
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/expenses/:path*',
    '/budgets/:path*',
    '/analysis/:path*',
    '/investments/:path*',
    '/advisor/:path*',
    '/accounts/:path*',
    '/planning/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    '/admin/:path*',
    '/api/transactions/:path*',
    '/api/budgets/:path*',
    '/api/goals/:path*',
    '/api/accounts/:path*',
    '/api/portfolio/:path*',
    '/api/analysis/:path*',
    '/api/advisor/:path*',
    '/api/planning/:path*',
    '/api/stripe/:path*',
  ],
};
