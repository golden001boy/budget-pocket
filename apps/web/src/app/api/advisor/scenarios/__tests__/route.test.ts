import { NextRequest } from 'next/server';
import { GET } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: { scenario: { findMany: jest.fn(), count: jest.fn() } },
}));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as {
  scenario: { findMany: jest.Mock; count: jest.Mock };
};

function makeRequest(url: string) {
  return new NextRequest(new Request(url));
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/advisor/scenarios', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await GET(makeRequest('http://localhost/api/advisor/scenarios'));

    expect(response.status).toBe(401);
    expect(mockPrisma.scenario.findMany).not.toHaveBeenCalled();
  });

  it('paginates results and scopes the query to the current user (story 15.18)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.scenario.findMany.mockResolvedValue([{ id: 's1' }]);
    mockPrisma.scenario.count.mockResolvedValue(1);

    const response = await GET(makeRequest('http://localhost/api/advisor/scenarios?page=2&pageSize=10'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockPrisma.scenario.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' }, skip: 10, take: 10 }),
    );
    expect(body).toEqual({
      data: [{ id: 's1' }],
      meta: { total: 1, page: 2, pageSize: 10, totalPages: 1 },
    });
  });

  it('never lets pageSize exceed the shared MAX_PAGE_SIZE cap', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.scenario.findMany.mockResolvedValue([]);
    mockPrisma.scenario.count.mockResolvedValue(0);

    await GET(makeRequest('http://localhost/api/advisor/scenarios?pageSize=99999'));

    expect(mockPrisma.scenario.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });
});
