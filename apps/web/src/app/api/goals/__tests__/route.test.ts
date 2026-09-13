import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: { financialGoal: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() } },
}));
jest.mock('@/lib/rateLimit', () => ({ checkMutationRateLimit: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as {
  financialGoal: { findMany: jest.Mock; count: jest.Mock; create: jest.Mock };
};
const mockCheckMutationRateLimit = checkMutationRateLimit as jest.Mock;

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new Request(url, init));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
});

describe('GET /api/goals', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await GET(makeRequest('http://localhost/api/goals'));

    expect(response.status).toBe(401);
  });

  it('paginates and scopes the query to the current user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.financialGoal.findMany.mockResolvedValue([{ id: 'g1' }]);
    mockPrisma.financialGoal.count.mockResolvedValue(1);

    const response = await GET(makeRequest('http://localhost/api/goals'));
    const body = await response.json();

    expect(mockPrisma.financialGoal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
    expect(body).toEqual({ data: [{ id: 'g1' }], meta: { total: 1, page: 1, pageSize: 20, totalPages: 1 } });
  });
});

describe('POST /api/goals', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(makeRequest('http://localhost/api/goals', { method: 'POST', body: '{}' }));

    expect(response.status).toBe(401);
  });

  it('rejects with 429 once the mutation rate limit is hit', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, resetAt: 0 });

    const response = await POST(makeRequest('http://localhost/api/goals', {
      method: 'POST',
      body: JSON.stringify({ name: 'Voiture', type: 'PURCHASE', targetAmount: 5000 }),
    }));

    expect(response.status).toBe(429);
    expect(mockPrisma.financialGoal.create).not.toHaveBeenCalled();
  });

  it('rejects an invalid body with 400', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(makeRequest('http://localhost/api/goals', {
      method: 'POST',
      body: JSON.stringify({ name: '', type: 'NOT_REAL', targetAmount: -5 }),
    }));

    expect(response.status).toBe(400);
    expect(mockPrisma.financialGoal.create).not.toHaveBeenCalled();
  });

  it('creates the goal for the current user with status ACTIVE', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.financialGoal.create.mockResolvedValue({ id: 'g1', name: 'Voiture' });

    const response = await POST(makeRequest('http://localhost/api/goals', {
      method: 'POST',
      body: JSON.stringify({ name: 'Voiture', type: 'PURCHASE', targetAmount: 5000 }),
    }));

    expect(response.status).toBe(201);
    expect(mockPrisma.financialGoal.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'user-1', status: 'ACTIVE' }) }),
    );
  });
});
