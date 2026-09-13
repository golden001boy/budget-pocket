import { GET } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { cacheGetOrSet } from '@/lib/cache';
import { projectForecast } from '@/lib/analytics/forecast';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({ prisma: { monthlySnapshot: { findMany: jest.fn() } } }));
jest.mock('@/lib/analytics/forecast', () => ({ projectForecast: jest.fn() }));
jest.mock('@/lib/cache', () => ({
  // Pass-through: exercises the real route logic (including the DB call)
  // without needing a real Redis connection.
  cacheGetOrSet: jest.fn((_key: string, fn: () => Promise<unknown>) => fn()),
  CACHE_TTL: { FORECAST: 3600 },
}));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as { monthlySnapshot: { findMany: jest.Mock } };
const mockProjectForecast = projectForecast as jest.Mock;

function makeRequest(url: string) {
  return new Request(url);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/analysis/forecast', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await GET(makeRequest('http://localhost/api/analysis/forecast'));

    expect(response.status).toBe(401);
    expect(mockPrisma.monthlySnapshot.findMany).not.toHaveBeenCalled();
  });

  it('caps months at 3 for a FREE user regardless of the requested value', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1', role: 'FREE' } });
    mockPrisma.monthlySnapshot.findMany.mockResolvedValue([]);
    mockProjectForecast.mockReturnValue([]);

    await GET(makeRequest('http://localhost/api/analysis/forecast?months=12'));

    expect(mockProjectForecast).toHaveBeenCalledWith([], 3);
  });

  it('allows up to 12 months for a PREMIUM user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1', role: 'PREMIUM' } });
    mockPrisma.monthlySnapshot.findMany.mockResolvedValue([]);
    mockProjectForecast.mockReturnValue([]);

    await GET(makeRequest('http://localhost/api/analysis/forecast?months=12'));

    expect(mockProjectForecast).toHaveBeenCalledWith([], 12);
  });

  it('returns the projected forecast scoped to the current user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1', role: 'PREMIUM' } });
    mockPrisma.monthlySnapshot.findMany.mockResolvedValue([]);
    mockProjectForecast.mockReturnValue([{ month: '2026-04', projected: 1000 }]);

    const response = await GET(makeRequest('http://localhost/api/analysis/forecast?months=6'));
    const body = await response.json();

    expect(mockPrisma.monthlySnapshot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
    expect(body).toEqual({ data: [{ month: '2026-04', projected: 1000 }] });
  });

  it('returns a clean 500 JSON instead of crashing when Prisma throws (story 15.24)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1', role: 'PREMIUM' } });
    mockPrisma.monthlySnapshot.findMany.mockRejectedValue(new Error('Can\'t reach database server'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET(makeRequest('http://localhost/api/analysis/forecast'));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erreur serveur' });

    errorSpy.mockRestore();
  });
});
