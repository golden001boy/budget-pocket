import { GET, POST } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { cacheDel } from '@/lib/cache';
import { MAX_JSON_BODY_BYTES } from '@/lib/requestBody';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    transaction: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() },
    budget: { update: jest.fn() },
  },
}));
jest.mock('@/lib/rateLimit', () => ({ checkMutationRateLimit: jest.fn() }));
jest.mock('@/lib/cache', () => ({ cacheDel: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as {
  transaction: { findMany: jest.Mock; count: jest.Mock; create: jest.Mock };
  budget: { update: jest.Mock };
};
const mockCheckMutationRateLimit = checkMutationRateLimit as jest.Mock;

function makeRequest(url: string, init?: RequestInit) {
  return new Request(url, init);
}

const validBody = {
  category: 'FOOD', type: 'EXPENSE', amount: 25.5, date: '2026-03-01',
};

const fakeTx = {
  id: 'tx1', amount: '25.5', date: new Date('2026-03-01'),
  createdAt: new Date('2026-03-01'), updatedAt: new Date('2026-03-01'),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
});

describe('GET /api/transactions', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await GET(makeRequest('http://localhost/api/transactions'));

    expect(response.status).toBe(401);
  });

  it('scopes the query to the current user and serializes Decimal/Date fields', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.transaction.findMany.mockResolvedValue([fakeTx]);
    mockPrisma.transaction.count.mockResolvedValue(1);

    const response = await GET(makeRequest('http://localhost/api/transactions'));
    const body = await response.json();

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
    expect(body.data[0].amount).toBe(25.5);
    expect(typeof body.data[0].date).toBe('string');
  });

  it('adds category/type/date-range filters only when provided', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.transaction.count.mockResolvedValue(0);

    await GET(makeRequest('http://localhost/api/transactions?category=FOOD&type=EXPENSE&from=2026-01-01&to=2026-01-31'));

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-1',
          category: 'FOOD',
          type: 'EXPENSE',
          date: { gte: new Date('2026-01-01'), lte: new Date('2026-01-31') },
        },
      }),
    );
  });
});

describe('POST /api/transactions', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(makeRequest('http://localhost/api/transactions', { method: 'POST', body: '{}' }));

    expect(response.status).toBe(401);
  });

  it('rejects with 429 once the mutation rate limit is hit', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, resetAt: 0 });

    const response = await POST(makeRequest('http://localhost/api/transactions', {
      method: 'POST', body: JSON.stringify(validBody),
    }));

    expect(response.status).toBe(429);
    expect(mockPrisma.transaction.create).not.toHaveBeenCalled();
  });

  it('rejects an invalid body with 400', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(makeRequest('http://localhost/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ ...validBody, amount: -5 }),
    }));

    expect(response.status).toBe(400);
    expect(mockPrisma.transaction.create).not.toHaveBeenCalled();
  });

  it('rejects an oversized body with 413 before it reaches validation (story 15.30)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(makeRequest('http://localhost/api/transactions', {
      method: 'POST', body: 'x'.repeat(MAX_JSON_BODY_BYTES + 1),
    }));

    expect(response.status).toBe(413);
    expect(mockPrisma.transaction.create).not.toHaveBeenCalled();
  });

  it('creates the transaction, invalidates the monthly snapshot cache, and skips the budget update when no budgetId is given', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1', currency: 'XOF' } });
    mockPrisma.transaction.create.mockResolvedValue(fakeTx);

    const response = await POST(makeRequest('http://localhost/api/transactions', {
      method: 'POST', body: JSON.stringify(validBody),
    }));

    expect(response.status).toBe(201);
    expect(mockPrisma.budget.update).not.toHaveBeenCalled();
    expect(cacheDel).toHaveBeenCalledWith('snapshot:user-1:2026:3');
  });

  it('increments the linked budget.spent when an expense is tied to a budgetId', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1', currency: 'XOF' } });
    mockPrisma.transaction.create.mockResolvedValue(fakeTx);

    await POST(makeRequest('http://localhost/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ ...validBody, budgetId: 'cku00000000000000000000a' }),
    }));

    expect(mockPrisma.budget.update).toHaveBeenCalledWith({
      where: { id: 'cku00000000000000000000a' },
      data: { spent: { increment: 25.5 } },
    });
  });

  it('returns a clean 500 JSON instead of crashing when Prisma throws (story 15.24)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1', currency: 'XOF' } });
    mockPrisma.transaction.create.mockRejectedValue(new Error('Can\'t reach database server'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(makeRequest('http://localhost/api/transactions', {
      method: 'POST', body: JSON.stringify(validBody),
    }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erreur serveur' });

    errorSpy.mockRestore();
  });
});
