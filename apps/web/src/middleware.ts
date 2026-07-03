import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Redirect to onboarding if not done
    if (
      token &&
      !token.onboardingDone &&
      pathname.startsWith('/dashboard') &&
      !pathname.startsWith('/onboarding')
    ) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // Admin guard
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

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
    '/api/alerts/:path*',
    '/api/planning/:path*',
    '/api/stripe/:path*',
  ],
};
