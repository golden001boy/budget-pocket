import { GET, PATCH, DELETE } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { cacheDel } from '@/lib/cache';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: { transaction: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() } },
}));
jest.mock('@/lib/rateLimit', () => ({ checkMutationRateLimit: jest.fn() }));
jest.mock('@/lib/cache', () => ({ cacheDel: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as {
  transaction: { findUnique: jest.Mock; update: jest.Mock; delete: jest.Mock };
};
const mockCheckMutationRateLimit = checkMutationRateLimit as jest.Mock;

function makeRequest(url: string, init?: RequestInit) {
  return new Request(url, init);
}
const params = Promise.resolve({ id: 'tx1' });

const fakeTx = {
  id: 'tx1', userId: 'user-1', amount: '25.5', date: new Date('2026-03-01'),
  createdAt: new Date('2026-03-01'), updatedAt: new Date('2026-03-01'),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
});

describe('GET /api/transactions/[id]', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await GET(makeRequest('http://localhost/api/transactions/tx1'), { params });

    expect(response.status).toBe(401);
  });

  it('returns 404 for a transaction that belongs to another user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-2' } });
    mockPrisma.transaction.findUnique.mockResolvedValue(fakeTx);

    const response = await GET(makeRequest('http://localhost/api/transactions/tx1'), { params });

    expect(response.status).toBe(404);
  });

  it('returns the serialized transaction for its owner', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.transaction.findUnique.mockResolvedValue(fakeTx);

    const response = await GET(makeRequest('http://localhost/api/transactions/tx1'), { params });
    const body = await response.json();

    expect(body.data.amount).toBe(25.5);
  });
});

describe('PATCH /api/transactions/[id]', () => {
  it('rejects with 429 once the mutation rate limit is hit, before looking up the transaction', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, resetAt: 0 });

    const response = await PATCH(makeRequest('http://localhost/api/transactions/tx1', { method: 'PATCH', body: '{}' }), { params });

    expect(response.status).toBe(429);
    expect(mockPrisma.transaction.findUnique).not.toHaveBeenCalled();
  });

  it('returns 404 for a transaction owned by another user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-2' } });
    mockPrisma.transaction.findUnique.mockResolvedValue(fakeTx);

    const response = await PATCH(makeRequest('http://localhost/api/transactions/tx1', {
      method: 'PATCH', body: JSON.stringify({ amount: 30 }),
    }), { params });

    expect(response.status).toBe(404);
    expect(mockPrisma.transaction.update).not.toHaveBeenCalled();
  });

  it('rejects an invalid body with 400', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.transaction.findUnique.mockResolvedValue(fakeTx);

    const response = await PATCH(makeRequest('http://localhost/api/transactions/tx1', {
      method: 'PATCH', body: JSON.stringify({ amount: -30 }),
    }), { params });

    expect(response.status).toBe(400);
    expect(mockPrisma.transaction.update).not.toHaveBeenCalled();
  });

  it('updates only the fields provided, and invalidates the snapshot cache for the ORIGINAL date', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.transaction.findUnique.mockResolvedValue(fakeTx);
    mockPrisma.transaction.update.mockResolvedValue({ ...fakeTx, amount: '30' });

    const response = await PATCH(makeRequest('http://localhost/api/transactions/tx1', {
      method: 'PATCH', body: JSON.stringify({ amount: 30 }),
    }), { params });

    expect(response.status).toBe(200);
    expect(mockPrisma.transaction.update).toHaveBeenCalledWith({ where: { id: 'tx1' }, data: { amount: 30 } });
    expect(cacheDel).toHaveBeenCalledWith('snapshot:user-1:2026:3');
  });
});

describe('DELETE /api/transactions/[id]', () => {
  it('returns 404 for a transaction owned by another user, without deleting it', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-2' } });
    mockPrisma.transaction.findUnique.mockResolvedValue(fakeTx);

    const response = await DELETE(makeRequest('http://localhost/api/transactions/tx1', { method: 'DELETE' }), { params });

    expect(response.status).toBe(404);
    expect(mockPrisma.transaction.delete).not.toHaveBeenCalled();
  });

  it('deletes the transaction and invalidates the snapshot cache', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.transaction.findUnique.mockResolvedValue(fakeTx);

    const response = await DELETE(makeRequest('http://localhost/api/transactions/tx1', { method: 'DELETE' }), { params });

    expect(response.status).toBe(204);
    expect(mockPrisma.transaction.delete).toHaveBeenCalledWith({ where: { id: 'tx1' } });
    expect(cacheDel).toHaveBeenCalledWith('snapshot:user-1:2026:3');
  });
});
