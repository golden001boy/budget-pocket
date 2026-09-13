import { authMiddleware } from '../middleware';
import type { NextRequestWithAuth } from 'next-auth/middleware';

function makeReq(pathname: string, token: Record<string, unknown> | null): NextRequestWithAuth {
  const url = `http://localhost${pathname}`;
  return {
    nextUrl: new URL(url),
    url,
    nextauth: { token },
  } as unknown as NextRequestWithAuth;
}

describe('authMiddleware (story 15.21)', () => {
  it('returns a clean 401 JSON for an unauthenticated /api/* route, instead of a redirect', async () => {
    const res = authMiddleware(makeReq('/api/transactions', null));

    expect(res.status).toBe(401);
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('redirects to /login with callbackUrl for an unauthenticated page route', () => {
    const res = authMiddleware(makeReq('/dashboard', null));

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain(encodeURIComponent('http://localhost/dashboard'));
  });

  it('lets an authenticated request through when onboarding is done and no admin path is involved', () => {
    const res = authMiddleware(makeReq('/dashboard', { onboardingDone: true, role: 'FREE' }));

    // NextResponse.next() carries no redirect location and a 200-ish default.
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects an authenticated-but-not-onboarded user to /onboarding', () => {
    const res = authMiddleware(makeReq('/dashboard', { onboardingDone: false, role: 'FREE' }));

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/onboarding');
  });

  it('redirects a non-admin away from /admin routes', () => {
    const res = authMiddleware(makeReq('/admin/users', { onboardingDone: true, role: 'FREE' }));

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/dashboard');
  });

  it('lets an admin through to /admin routes', () => {
    const res = authMiddleware(makeReq('/admin/users', { onboardingDone: true, role: 'ADMIN' }));

    expect(res.headers.get('location')).toBeNull();
  });

  it('still 401s a protected /api/* route even without an onboarding/role check applying', () => {
    const res = authMiddleware(makeReq('/api/goals', null));

    expect(res.status).toBe(401);
  });
});
