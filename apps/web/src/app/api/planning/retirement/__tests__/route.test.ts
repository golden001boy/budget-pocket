import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({ prisma: { retirementPlan: { findUnique: jest.fn(), upsert: jest.fn() } } }));
jest.mock('@/lib/rateLimit', () => ({ checkMutationRateLimit: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as { retirementPlan: { findUnique: jest.Mock; upsert: jest.Mock } };
const mockCheckMutationRateLimit = checkMutationRateLimit as jest.Mock;

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new Request(url, init));
}

const validBody = {
  currentAge: 30, targetRetirementAge: 65, currentSavings: 1000,
  monthlyContribution: 100, targetMonthlyIncome: 2000,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
});

describe('GET /api/planning/retirement', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it('returns the plan scoped to the current user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.retirementPlan.findUnique.mockResolvedValue({ userId: 'user-1' });

    await GET();

    expect(mockPrisma.retirementPlan.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });
});

describe('POST /api/planning/retirement', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(makeRequest('http://localhost/api/planning/retirement', { method: 'POST', body: '{}' }));

    expect(response.status).toBe(401);
  });

  it('rejects with 429 once the mutation rate limit is hit', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, resetAt: 0 });

    const response = await POST(makeRequest('http://localhost/api/planning/retirement', {
      method: 'POST', body: JSON.stringify(validBody),
    }));

    expect(response.status).toBe(429);
    expect(mockPrisma.retirementPlan.upsert).not.toHaveBeenCalled();
  });

  it('rejects an invalid body with 400', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(makeRequest('http://localhost/api/planning/retirement', {
      method: 'POST', body: JSON.stringify({ ...validBody, currentAge: 5 }),
    }));

    expect(response.status).toBe(400);
    expect(mockPrisma.retirementPlan.upsert).not.toHaveBeenCalled();
  });

  it('upserts the plan scoped to the current user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.retirementPlan.upsert.mockResolvedValue({ userId: 'user-1', ...validBody });

    const response = await POST(makeRequest('http://localhost/api/planning/retirement', {
      method: 'POST', body: JSON.stringify(validBody),
    }));

    expect(response.status).toBe(200);
    expect(mockPrisma.retirementPlan.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
  });

  it('returns a clean 500 JSON instead of crashing when Prisma throws (story 15.24)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.retirementPlan.upsert.mockRejectedValue(new Error('Can\'t reach database server'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(makeRequest('http://localhost/api/planning/retirement', {
      method: 'POST', body: JSON.stringify(validBody),
    }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erreur serveur' });

    errorSpy.mockRestore();
  });
});
