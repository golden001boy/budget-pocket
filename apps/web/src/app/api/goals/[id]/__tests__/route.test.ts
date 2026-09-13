import { NextRequest } from 'next/server';
import { PATCH, DELETE } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: { financialGoal: { findFirst: jest.fn(), update: jest.fn(), delete: jest.fn() } },
}));
jest.mock('@/lib/rateLimit', () => ({ checkMutationRateLimit: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as {
  financialGoal: { findFirst: jest.Mock; update: jest.Mock; delete: jest.Mock };
};
const mockCheckMutationRateLimit = checkMutationRateLimit as jest.Mock;

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new Request(url, init));
}
const params = Promise.resolve({ id: 'g1' });

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
});

describe('PATCH /api/goals/[id]', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await PATCH(makeRequest('http://localhost/api/goals/g1', { method: 'PATCH', body: '{}' }), { params });

    expect(response.status).toBe(401);
  });

  it('rejects with 429 once the mutation rate limit is hit, before even looking up the goal', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, resetAt: 0 });

    const response = await PATCH(makeRequest('http://localhost/api/goals/g1', { method: 'PATCH', body: '{}' }), { params });

    expect(response.status).toBe(429);
    expect(mockPrisma.financialGoal.findFirst).not.toHaveBeenCalled();
  });

  it('returns 404 for a goal that does not belong to the current user (or does not exist)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.financialGoal.findFirst.mockResolvedValue(null);

    const response = await PATCH(makeRequest('http://localhost/api/goals/g1', {
      method: 'PATCH',
      body: JSON.stringify({ currentAmount: 100 }),
    }), { params });

    expect(response.status).toBe(404);
    expect(mockPrisma.financialGoal.findFirst).toHaveBeenCalledWith({ where: { id: 'g1', userId: 'user-1' } });
  });

  it('rejects an invalid body with 400', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.financialGoal.findFirst.mockResolvedValue({ id: 'g1' });

    const response = await PATCH(makeRequest('http://localhost/api/goals/g1', {
      method: 'PATCH',
      body: JSON.stringify({ currentAmount: -100 }),
    }), { params });

    expect(response.status).toBe(400);
    expect(mockPrisma.financialGoal.update).not.toHaveBeenCalled();
  });

  it('updates the goal when it belongs to the current user and the body is valid', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.financialGoal.findFirst.mockResolvedValue({ id: 'g1' });
    mockPrisma.financialGoal.update.mockResolvedValue({ id: 'g1', currentAmount: 200 });

    const response = await PATCH(makeRequest('http://localhost/api/goals/g1', {
      method: 'PATCH',
      body: JSON.stringify({ currentAmount: 200 }),
    }), { params });

    expect(response.status).toBe(200);
    expect(mockPrisma.financialGoal.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'g1' }, data: expect.objectContaining({ currentAmount: 200 }) }),
    );
  });

  it('returns a clean 500 JSON instead of crashing when Prisma throws (story 15.24)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.financialGoal.findFirst.mockRejectedValue(new Error('Can\'t reach database server'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await PATCH(makeRequest('http://localhost/api/goals/g1', {
      method: 'PATCH', body: JSON.stringify({ currentAmount: 200 }),
    }), { params });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erreur serveur' });

    errorSpy.mockRestore();
  });
});

describe('DELETE /api/goals/[id]', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await DELETE(makeRequest('http://localhost/api/goals/g1', { method: 'DELETE' }), { params });

    expect(response.status).toBe(401);
  });

  it('returns 404 for a goal that does not belong to the current user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.financialGoal.findFirst.mockResolvedValue(null);

    const response = await DELETE(makeRequest('http://localhost/api/goals/g1', { method: 'DELETE' }), { params });

    expect(response.status).toBe(404);
    expect(mockPrisma.financialGoal.delete).not.toHaveBeenCalled();
  });

  it('deletes the goal when it belongs to the current user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.financialGoal.findFirst.mockResolvedValue({ id: 'g1' });

    const response = await DELETE(makeRequest('http://localhost/api/goals/g1', { method: 'DELETE' }), { params });
    const body = await response.json();

    expect(body).toEqual({ success: true });
    expect(mockPrisma.financialGoal.delete).toHaveBeenCalledWith({ where: { id: 'g1' } });
  });
});
