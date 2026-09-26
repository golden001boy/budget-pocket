import { NextRequest } from 'next/server';
import { PATCH } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { MAX_JSON_BODY_BYTES } from '@/lib/requestBody';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({ prisma: { user: { update: jest.fn() } } }));
jest.mock('@/lib/rateLimit', () => ({ checkMutationRateLimit: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as { user: { update: jest.Mock } };
const mockCheckMutationRateLimit = checkMutationRateLimit as jest.Mock;

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new Request(url, init));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
});

describe('PATCH /api/user/profile', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await PATCH(makeRequest('http://localhost/api/user/profile', { method: 'PATCH', body: '{}' }));

    expect(response.status).toBe(401);
  });

  it('rejects with 429 once the mutation rate limit is hit', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, resetAt: 0 });

    const response = await PATCH(makeRequest('http://localhost/api/user/profile', {
      method: 'PATCH', body: JSON.stringify({ name: 'New Name' }),
    }));

    expect(response.status).toBe(429);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects an invalid body with 400', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await PATCH(makeRequest('http://localhost/api/user/profile', {
      method: 'PATCH', body: JSON.stringify({ currency: 'NOT_A_CURRENCY' }),
    }));

    expect(response.status).toBe(400);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects an oversized body with 413 before it reaches validation (story 15.30)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await PATCH(makeRequest('http://localhost/api/user/profile', {
      method: 'PATCH', body: 'x'.repeat(MAX_JSON_BODY_BYTES + 1),
    }));

    expect(response.status).toBe(413);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('updates only the current user, never a different one from a client-supplied id', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.user.update.mockResolvedValue({ id: 'user-1', name: 'New Name' });

    const response = await PATCH(makeRequest('http://localhost/api/user/profile', {
      // A client-supplied id must never override session.user.id — the
      // schema doesn't whitelist `id`, so Zod strips it before it reaches Prisma.
      method: 'PATCH', body: JSON.stringify({ id: 'someone-elses-id', name: 'New Name' }),
    }));

    expect(response.status).toBe(200);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user-1' }, data: { name: 'New Name' } }),
    );
  });

  it('returns a clean 500 JSON instead of crashing when Prisma throws (story 15.24)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.user.update.mockRejectedValue(new Error('Can\'t reach database server'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await PATCH(makeRequest('http://localhost/api/user/profile', {
      method: 'PATCH', body: JSON.stringify({ name: 'New Name' }),
    }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erreur serveur' });

    errorSpy.mockRestore();
  });
});
