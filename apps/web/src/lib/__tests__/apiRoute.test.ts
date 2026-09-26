import { withApiRoute, withDynamicApiRoute } from '../apiRoute';
import { getServerSession } from 'next-auth';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { PayloadTooLargeError } from '@/lib/requestBody';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/rateLimit', () => ({ checkMutationRateLimit: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockCheckMutationRateLimit = checkMutationRateLimit as jest.Mock;

function makeRequest() {
  return new Request('http://localhost/api/whatever');
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('withApiRoute (static routes)', () => {
  it('returns 401 without calling the handler when there is no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const handler = jest.fn();

    const route = withApiRoute(handler, { name: 'test:GET' });
    const response = await route(makeRequest());

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not check the rate limit when rateLimit is not set (read-only routes)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    const handler = jest.fn().mockResolvedValue(new Response(null, { status: 200 }));

    const route = withApiRoute(handler, { name: 'test:GET' });
    await route(makeRequest());

    expect(mockCheckMutationRateLimit).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('returns 429 without calling the handler once the mutation rate limit is hit', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, resetAt: 0 });
    const handler = jest.fn();

    const route = withApiRoute(handler, { name: 'test:POST', rateLimit: true });
    const response = await route(makeRequest());

    expect(response.status).toBe(429);
    expect(mockCheckMutationRateLimit).toHaveBeenCalledWith('user-1');
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls the handler with the request and the session', async () => {
    const session = { user: { id: 'user-1' } };
    mockGetSession.mockResolvedValue(session);
    mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
    const handler = jest.fn().mockResolvedValue(new Response(null, { status: 200 }));

    const route = withApiRoute(handler, { name: 'test:POST', rateLimit: true });
    const req = makeRequest();
    await route(req);

    expect(handler).toHaveBeenCalledWith(req, { session });
  });

  it('passes the handler response straight through on success', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    const handlerResponse = new Response(JSON.stringify({ data: 'ok' }), { status: 201 });
    const handler = jest.fn().mockResolvedValue(handlerResponse);

    const route = withApiRoute(handler, { name: 'test:POST' });
    const response = await route(makeRequest());

    expect(response).toBe(handlerResponse);
  });

  it('returns 413 when the handler throws PayloadTooLargeError, without logging it as a server error', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    const handler = jest.fn().mockRejectedValue(new PayloadTooLargeError(102400));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const route = withApiRoute(handler, { name: 'test:POST' });
    const response = await route(makeRequest());

    expect(response.status).toBe(413);
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it('returns a clean 500 JSON tagged with the route name when the handler throws', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    const handler = jest.fn().mockRejectedValue(new Error('Can\'t reach database server'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const route = withApiRoute(handler, { name: 'budgets:POST' });
    const response = await route(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Erreur serveur' });
    expect(errorSpy).toHaveBeenCalledWith('[budgets:POST]', expect.any(Error));

    errorSpy.mockRestore();
  });

  it('returns 401 before ever touching the rate limit, even when rateLimit is requested', async () => {
    mockGetSession.mockResolvedValue(null);
    const handler = jest.fn();

    const route = withApiRoute(handler, { name: 'test:POST', rateLimit: true });
    await route(makeRequest());

    expect(mockCheckMutationRateLimit).not.toHaveBeenCalled();
  });
});

describe('withDynamicApiRoute (routes with a dynamic segment)', () => {
  it('returns 401 without calling the handler when there is no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const handler = jest.fn();

    const route = withDynamicApiRoute<{ id: string }>(handler, { name: 'test:PATCH' });
    const response = await route(makeRequest(), { params: Promise.resolve({ id: 'tx1' }) });

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('resolves and passes through params alongside the session', async () => {
    const session = { user: { id: 'user-1' } };
    mockGetSession.mockResolvedValue(session);
    const handler = jest.fn().mockResolvedValue(new Response(null, { status: 200 }));

    const route = withDynamicApiRoute<{ id: string }>(handler, { name: 'test:PATCH' });
    const req = makeRequest();
    await route(req, { params: Promise.resolve({ id: 'tx1' }) });

    expect(handler).toHaveBeenCalledWith(req, { session, params: { id: 'tx1' } });
  });

  it('returns 429 without calling the handler once the mutation rate limit is hit', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, resetAt: 0 });
    const handler = jest.fn();

    const route = withDynamicApiRoute<{ id: string }>(handler, { name: 'test:DELETE', rateLimit: true });
    const response = await route(makeRequest(), { params: Promise.resolve({ id: 'g1' }) });

    expect(response.status).toBe(429);
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns 413 when the handler throws PayloadTooLargeError', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    const handler = jest.fn().mockRejectedValue(new PayloadTooLargeError(102400));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const route = withDynamicApiRoute<{ id: string }>(handler, { name: 'test:PATCH' });
    const response = await route(makeRequest(), { params: Promise.resolve({ id: 'g1' }) });

    expect(response.status).toBe(413);
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it('returns a clean 500 JSON tagged with the route name when the handler throws', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    const handler = jest.fn().mockRejectedValue(new Error('Can\'t reach database server'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const route = withDynamicApiRoute<{ id: string }>(handler, { name: 'goals/[id]:PATCH' });
    const response = await route(makeRequest(), { params: Promise.resolve({ id: 'g1' }) });
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Erreur serveur' });
    expect(errorSpy).toHaveBeenCalledWith('[goals/[id]:PATCH]', expect.any(Error));

    errorSpy.mockRestore();
  });
});
