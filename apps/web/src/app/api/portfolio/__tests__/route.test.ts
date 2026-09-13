import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: { portfolioItem: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() } },
}));
jest.mock('@/lib/rateLimit', () => ({ checkMutationRateLimit: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as {
  portfolioItem: { findMany: jest.Mock; count: jest.Mock; create: jest.Mock };
};
const mockCheckMutationRateLimit = checkMutationRateLimit as jest.Mock;

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new Request(url, init));
}

const validBody = {
  assetClass: 'STOCK', name: 'Apple', ticker: 'AAPL',
  quantity: 10, averageCost: 150, purchaseDate: '2026-01-01',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
});

describe('GET /api/portfolio', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await GET(makeRequest('http://localhost/api/portfolio'));

    expect(response.status).toBe(401);
  });

  it('paginates and scopes the query to the current user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.portfolioItem.findMany.mockResolvedValue([{ id: 'p1' }]);
    mockPrisma.portfolioItem.count.mockResolvedValue(1);

    const response = await GET(makeRequest('http://localhost/api/portfolio'));

    expect(mockPrisma.portfolioItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
    expect(response.status).toBe(200);
  });
});

describe('POST /api/portfolio', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(makeRequest('http://localhost/api/portfolio', { method: 'POST', body: '{}' }));

    expect(response.status).toBe(401);
  });

  it('rejects with 429 once the mutation rate limit is hit', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, resetAt: 0 });

    const response = await POST(makeRequest('http://localhost/api/portfolio', {
      method: 'POST', body: JSON.stringify(validBody),
    }));

    expect(response.status).toBe(429);
    expect(mockPrisma.portfolioItem.create).not.toHaveBeenCalled();
  });

  it('rejects an invalid body with 400', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(makeRequest('http://localhost/api/portfolio', {
      method: 'POST',
      body: JSON.stringify({ ...validBody, quantity: -1 }),
    }));

    expect(response.status).toBe(400);
    expect(mockPrisma.portfolioItem.create).not.toHaveBeenCalled();
  });

  it('creates the portfolio item for the current user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.portfolioItem.create.mockResolvedValue({ id: 'p1', ...validBody });

    const response = await POST(makeRequest('http://localhost/api/portfolio', {
      method: 'POST', body: JSON.stringify(validBody),
    }));

    expect(response.status).toBe(201);
    expect(mockPrisma.portfolioItem.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'user-1', ticker: 'AAPL' }) }),
    );
  });

  it('returns a clean 500 JSON instead of crashing when Prisma throws (story 15.24)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.portfolioItem.create.mockRejectedValue(new Error('Can\'t reach database server'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(makeRequest('http://localhost/api/portfolio', {
      method: 'POST', body: JSON.stringify(validBody),
    }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erreur serveur' });

    errorSpy.mockRestore();
  });
});
