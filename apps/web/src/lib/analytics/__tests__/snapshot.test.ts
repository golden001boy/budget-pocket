import { Decimal } from 'decimal.js';
import { computeMonthlySnapshot } from '../snapshot';
import { prisma } from '../../prisma';
import { cacheGet, cacheSet, CACHE_TTL } from '../../cache';

jest.mock('../../prisma', () => ({
  prisma: {
    monthlySnapshot: { findUnique: jest.fn(), upsert: jest.fn() },
    transaction: { findMany: jest.fn() },
  },
}));

jest.mock('../../cache', () => ({
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
  CACHE_TTL: { MONTHLY_SNAPSHOT: 60 * 60 * 6 },
}));

const mockPrisma = prisma as unknown as {
  monthlySnapshot: { findUnique: jest.Mock; upsert: jest.Mock };
  transaction: { findMany: jest.Mock };
};
const mockCacheGet = cacheGet as jest.Mock;
const mockCacheSet = cacheSet as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('computeMonthlySnapshot', () => {
  it('returns the cached value without touching the database', async () => {
    const cached = { id: 'u-2026-1', userId: 'u', year: 2026, month: 1 };
    mockCacheGet.mockResolvedValue(cached);

    const result = await computeMonthlySnapshot('u', 2026, 1);

    expect(result).toBe(cached);
    expect(mockPrisma.monthlySnapshot.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.transaction.findMany).not.toHaveBeenCalled();
  });

  it('short-circuits on a fresh DB row when the cache misses (fixes story 15.13 dashboard contention)', async () => {
    mockCacheGet.mockResolvedValue(null);
    mockPrisma.monthlySnapshot.findUnique.mockResolvedValue({
      id: 'snap-1',
      userId: 'u',
      year: 2026,
      month: 1,
      totalIncome: new Decimal(1000),
      totalExpenses: new Decimal(400),
      totalSavings: new Decimal(600),
      savingsRate: new Decimal(60),
      netWorth: null,
      categoryBreakdown: { FOOD: 400 },
      computedAt: new Date(),
    });

    const result = await computeMonthlySnapshot('u', 2026, 1);

    expect(result.totalIncome).toBe(1000);
    expect(mockPrisma.transaction.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.monthlySnapshot.upsert).not.toHaveBeenCalled();
    expect(mockCacheSet).toHaveBeenCalledWith(
      'snapshot:u:2026:1',
      expect.objectContaining({ totalIncome: 1000 }),
      CACHE_TTL.MONTHLY_SNAPSHOT,
    );
  });

  it('recomputes when the DB row is older than the cache TTL', async () => {
    mockCacheGet.mockResolvedValue(null);
    const stale = new Date(Date.now() - (CACHE_TTL.MONTHLY_SNAPSHOT * 1000 + 1000));
    mockPrisma.monthlySnapshot.findUnique.mockResolvedValue({
      id: 'snap-1',
      userId: 'u',
      year: 2026,
      month: 1,
      totalIncome: new Decimal(1000),
      totalExpenses: new Decimal(400),
      totalSavings: new Decimal(600),
      savingsRate: new Decimal(60),
      netWorth: null,
      categoryBreakdown: {},
      computedAt: stale,
    });
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.monthlySnapshot.upsert.mockResolvedValue({});

    await computeMonthlySnapshot('u', 2026, 1);

    expect(mockPrisma.transaction.findMany).toHaveBeenCalled();
    expect(mockPrisma.monthlySnapshot.upsert).toHaveBeenCalled();
  });

  it('recomputes when there is no existing DB row', async () => {
    mockCacheGet.mockResolvedValue(null);
    mockPrisma.monthlySnapshot.findUnique.mockResolvedValue(null);
    mockPrisma.transaction.findMany.mockResolvedValue([
      { type: 'INCOME', amount: new Decimal(500), category: null },
      { type: 'EXPENSE', amount: new Decimal(200), category: 'FOOD' },
    ]);
    mockPrisma.monthlySnapshot.upsert.mockResolvedValue({});

    const result = await computeMonthlySnapshot('u', 2026, 1);

    expect(result.totalIncome).toBe(500);
    expect(result.totalExpenses).toBe(200);
    expect(mockPrisma.monthlySnapshot.upsert).toHaveBeenCalled();
  });
});
