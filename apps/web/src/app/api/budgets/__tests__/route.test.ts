import { GET, POST } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { MAX_JSON_BODY_BYTES } from '@/lib/requestBody';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: { budget: { findMany: jest.fn(), count: jest.fn(), upsert: jest.fn() } },
}));
jest.mock('@/lib/rateLimit', () => ({ checkMutationRateLimit: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as {
  budget: { findMany: jest.Mock; count: jest.Mock; upsert: jest.Mock };
};
const mockCheckMutationRateLimit = checkMutationRateLimit as jest.Mock;

function makeRequest(url: string, init?: RequestInit) {
  return new Request(url, init);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
});

describe('GET /api/budgets', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await GET(makeRequest('http://localhost/api/budgets'));

    expect(response.status).toBe(401);
  });

  it('scopes to user/month/year and converts Decimal fields to numbers', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.budget.findMany.mockResolvedValue([{ id: 'b1', amount: '100.50', spent: '20', alertAt: '80' }]);
    mockPrisma.budget.count.mockResolvedValue(1);

    const response = await GET(makeRequest('http://localhost/api/budgets?month=3&year=2026'));
    const body = await response.json();

    expect(mockPrisma.budget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1', month: 3, year: 2026 } }),
    );
    expect(body.data[0]).toEqual({ id: 'b1', amount: 100.5, spent: 20, alertAt: 80 });
  });
});

describe('POST /api/budgets', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(makeRequest('http://localhost/api/budgets', { method: 'POST', body: '{}' }));

    expect(response.status).toBe(401);
  });

  it('rejects with 429 once the mutation rate limit is hit', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, resetAt: 0 });

    const response = await POST(makeRequest('http://localhost/api/budgets', {
      method: 'POST',
      body: JSON.stringify({ category: 'FOOD', amount: 100, month: 3, year: 2026 }),
    }));

    expect(response.status).toBe(429);
    expect(mockPrisma.budget.upsert).not.toHaveBeenCalled();
  });

  it('rejects an invalid body with 400', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(makeRequest('http://localhost/api/budgets', {
      method: 'POST',
      body: JSON.stringify({ category: 'NOT_REAL', amount: -5, month: 13, year: 2026 }),
    }));

    expect(response.status).toBe(400);
    expect(mockPrisma.budget.upsert).not.toHaveBeenCalled();
  });

  it('rejects an oversized body with 413 before it reaches validation (story 15.30)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(makeRequest('http://localhost/api/budgets', {
      method: 'POST',
      body: 'x'.repeat(MAX_JSON_BODY_BYTES + 1),
    }));

    expect(response.status).toBe(413);
    expect(mockPrisma.budget.upsert).not.toHaveBeenCalled();
  });

  it('upserts the budget for the current user and converts Decimal fields back to numbers', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1', currency: 'XOF' } });
    mockPrisma.budget.upsert.mockResolvedValue({ id: 'b1', amount: '150', spent: '0', alertAt: '80' });

    const response = await POST(makeRequest('http://localhost/api/budgets', {
      method: 'POST',
      body: JSON.stringify({ category: 'FOOD', amount: 150, month: 3, year: 2026 }),
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(mockPrisma.budget.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_category_month_year: { userId: 'user-1', category: 'FOOD', month: 3, year: 2026 } },
      }),
    );
    expect(body.data).toEqual({ id: 'b1', amount: 150, spent: 0, alertAt: 80 });
  });

  it('returns a clean 500 JSON instead of crashing when Prisma throws (story 15.24)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1', currency: 'XOF' } });
    mockPrisma.budget.upsert.mockRejectedValue(new Error('Can\'t reach database server'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(makeRequest('http://localhost/api/budgets', {
      method: 'POST',
      body: JSON.stringify({ category: 'FOOD', amount: 150, month: 3, year: 2026 }),
    }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erreur serveur' });

    errorSpy.mockRestore();
  });
});
