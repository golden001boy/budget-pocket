import { NextRequest } from 'next/server';
import { GET } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: { taxRecord: { findMany: jest.fn(), count: jest.fn() } },
}));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as {
  taxRecord: { findMany: jest.Mock; count: jest.Mock };
};

function makeRequest(url: string) {
  return new NextRequest(new Request(url));
}

beforeEach(() => {
  jest.clearAllMocks();
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
});
