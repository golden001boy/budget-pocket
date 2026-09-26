import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { MAX_JSON_BODY_BYTES } from '@/lib/requestBody';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: { linkedAccount: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() } },
}));
jest.mock('@/lib/rateLimit', () => ({ checkMutationRateLimit: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as {
  linkedAccount: { findMany: jest.Mock; count: jest.Mock; create: jest.Mock };
};
const mockCheckMutationRateLimit = checkMutationRateLimit as jest.Mock;

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new Request(url, init));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
});

describe('GET /api/accounts', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await GET(makeRequest('http://localhost/api/accounts'));

    expect(response.status).toBe(401);
    expect(mockPrisma.linkedAccount.findMany).not.toHaveBeenCalled();
  });

  it('paginates and scopes the query to the current user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.linkedAccount.findMany.mockResolvedValue([{ id: 'a1' }]);
    mockPrisma.linkedAccount.count.mockResolvedValue(1);

    const response = await GET(makeRequest('http://localhost/api/accounts?page=1&pageSize=20'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockPrisma.linkedAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
    expect(body).toEqual({ data: [{ id: 'a1' }], meta: { total: 1, page: 1, pageSize: 20, totalPages: 1 } });
  });
});

describe('POST /api/accounts', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(makeRequest('http://localhost/api/accounts', { method: 'POST', body: '{}' }));

    expect(response.status).toBe(401);
  });

  it('rejects with 429 once the mutation rate limit is hit, without writing anything', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, resetAt: 0 });

    const response = await POST(makeRequest('http://localhost/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ accountName: 'Wave', provider: 'WAVE' }),
    }));

    expect(response.status).toBe(429);
    expect(mockPrisma.linkedAccount.create).not.toHaveBeenCalled();
  });

  it('rejects an invalid body with 400', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(makeRequest('http://localhost/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ accountName: '', provider: 'NOT_A_PROVIDER' }),
    }));

    expect(response.status).toBe(400);
    expect(mockPrisma.linkedAccount.create).not.toHaveBeenCalled();
  });

  it('rejects an oversized body with 413 before it reaches validation (story 15.30)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(makeRequest('http://localhost/api/accounts', {
      method: 'POST',
      body: 'x'.repeat(MAX_JSON_BODY_BYTES + 1),
    }));

    expect(response.status).toBe(413);
    expect(mockPrisma.linkedAccount.create).not.toHaveBeenCalled();
  });

  it('creates the account for the current user when the body is valid', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.linkedAccount.create.mockResolvedValue({ id: 'a1', accountName: 'Wave', provider: 'WAVE' });

    const response = await POST(makeRequest('http://localhost/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ accountName: 'Wave', provider: 'WAVE' }),
    }));

    expect(response.status).toBe(201);
    expect(mockPrisma.linkedAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'user-1', accountName: 'Wave' }) }),
    );
  });

  it('returns a clean 500 JSON instead of crashing when Prisma throws (story 15.24)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.linkedAccount.create.mockRejectedValue(new Error('Can\'t reach database server'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(makeRequest('http://localhost/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ accountName: 'Wave', provider: 'WAVE' }),
    }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erreur serveur' });

    errorSpy.mockRestore();
  });
});
