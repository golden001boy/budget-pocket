import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { MAX_JSON_BODY_BYTES } from '@/lib/requestBody';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: { taxRecord: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() } },
}));
jest.mock('@/lib/rateLimit', () => ({ checkMutationRateLimit: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as {
  taxRecord: { findMany: jest.Mock; count: jest.Mock; create: jest.Mock };
};
const mockCheckMutationRateLimit = checkMutationRateLimit as jest.Mock;

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new Request(url, init));
}

const validBody = { year: 2026, category: 'IMPOT_REVENU', amount: 100 };

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
});

describe('GET /api/planning/taxes', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await GET(makeRequest('http://localhost/api/planning/taxes'));

    expect(response.status).toBe(401);
    expect(mockPrisma.taxRecord.findMany).not.toHaveBeenCalled();
  });

  it('paginates results and scopes the query to the current user (story 15.18)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.taxRecord.findMany.mockResolvedValue([{ id: 't1' }]);
    mockPrisma.taxRecord.count.mockResolvedValue(1);

    const response = await GET(makeRequest('http://localhost/api/planning/taxes?page=1&pageSize=5'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockPrisma.taxRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' }, skip: 0, take: 5 }),
    );
    expect(body).toEqual({
      data: [{ id: 't1' }],
      meta: { total: 1, page: 1, pageSize: 5, totalPages: 1 },
    });
  });

  it('returns a clean 500 JSON instead of crashing when Prisma throws (story 15.24)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.taxRecord.findMany.mockRejectedValue(new Error('Can\'t reach database server'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET(makeRequest('http://localhost/api/planning/taxes'));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erreur serveur' });

    errorSpy.mockRestore();
  });
});

describe('POST /api/planning/taxes', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(makeRequest('http://localhost/api/planning/taxes', { method: 'POST', body: '{}' }));

    expect(response.status).toBe(401);
  });

  it('rejects with 429 once the mutation rate limit is hit', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, resetAt: 0 });

    const response = await POST(makeRequest('http://localhost/api/planning/taxes', {
      method: 'POST', body: JSON.stringify(validBody),
    }));

    expect(response.status).toBe(429);
    expect(mockPrisma.taxRecord.create).not.toHaveBeenCalled();
  });

  it('rejects an invalid body with 400', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(makeRequest('http://localhost/api/planning/taxes', {
      method: 'POST', body: JSON.stringify({ ...validBody, amount: -5 }),
    }));

    expect(response.status).toBe(400);
    expect(mockPrisma.taxRecord.create).not.toHaveBeenCalled();
  });

  it('rejects an oversized body with 413 before it reaches validation (story 15.30)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(makeRequest('http://localhost/api/planning/taxes', {
      method: 'POST', body: 'x'.repeat(MAX_JSON_BODY_BYTES + 1),
    }));

    expect(response.status).toBe(413);
    expect(mockPrisma.taxRecord.create).not.toHaveBeenCalled();
  });

  it('creates the tax record for the current user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.taxRecord.create.mockResolvedValue({ id: 't1', ...validBody });

    const response = await POST(makeRequest('http://localhost/api/planning/taxes', {
      method: 'POST', body: JSON.stringify(validBody),
    }));

    expect(response.status).toBe(201);
    expect(mockPrisma.taxRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'user-1', category: 'IMPOT_REVENU' }) }),
    );
  });

  it('returns a clean 500 JSON instead of crashing when Prisma throws (story 15.24)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.taxRecord.create.mockRejectedValue(new Error('Can\'t reach database server'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(makeRequest('http://localhost/api/planning/taxes', {
      method: 'POST', body: JSON.stringify(validBody),
    }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erreur serveur' });

    errorSpy.mockRestore();
  });
});
