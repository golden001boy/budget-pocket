import { prisma } from '../prisma';
import { cacheGet, cacheSet, CACHE_TTL } from '../cache';
import type { MonthlySnapshotDTO } from '@budget-pocket/shared';
import { Decimal } from 'decimal.js';

function isFresh(computedAt: Date): boolean {
  return Date.now() - computedAt.getTime() < CACHE_TTL.MONTHLY_SNAPSHOT * 1000;
}

export async function computeMonthlySnapshot(
  userId: string,
  year: number,
  month: number,
): Promise<MonthlySnapshotDTO> {
  const cacheKey = `snapshot:${userId}:${year}:${month}`;
  const cached = await cacheGet<MonthlySnapshotDTO>(cacheKey);
  if (cached) return cached;

  // When Redis is unreachable, cacheGet fails fast and silently (never
  // hits), so without this DB-level fallback every request would recompute
  // and re-upsert unconditionally — the row-lock contention found under
  // concurrent load in story 15.13 (ADR-010). This row is read by its
  // unique key, so it's a cheap read even under contention.
  const existing = await prisma.monthlySnapshot.findUnique({
    where: { userId_year_month: { userId, year, month } },
  });
  if (existing && isFresh(existing.computedAt)) {
    const snapshot: MonthlySnapshotDTO = {
      id:                existing.id,
      userId:            existing.userId,
      year:              existing.year,
      month:             existing.month,
      totalIncome:       existing.totalIncome.toNumber(),
      totalExpenses:     existing.totalExpenses.toNumber(),
      totalSavings:      existing.totalSavings.toNumber(),
      savingsRate:       existing.savingsRate.toNumber(),
      netWorth:          existing.netWorth ? existing.netWorth.toNumber() : null,
      categoryBreakdown: existing.categoryBreakdown as MonthlySnapshotDTO['categoryBreakdown'],
      computedAt:        existing.computedAt.toISOString(),
    };
    await cacheSet(cacheKey, snapshot, CACHE_TTL.MONTHLY_SNAPSHOT);
    return snapshot;
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate   = new Date(year, month, 0, 23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: startDate, lte: endDate } },
  });

  let totalIncome   = new Decimal(0);
  let totalExpenses = new Decimal(0);
  const categoryBreakdown: Record<string, number> = {};

  for (const tx of transactions) {
    const amount = new Decimal(tx.amount.toString());
    if (tx.type === 'INCOME') {
      totalIncome = totalIncome.plus(amount);
    } else if (tx.type === 'EXPENSE') {
      totalExpenses = totalExpenses.plus(amount);
      const key = tx.category as string;
      categoryBreakdown[key] = (categoryBreakdown[key] ?? 0) + amount.toNumber();
    }
  }

  const totalSavings = totalIncome.minus(totalExpenses);
  const savingsRate  = totalIncome.gt(0)
    ? totalSavings.div(totalIncome).times(100).toDecimalPlaces(2)
    : new Decimal(0);

  const snapshot: MonthlySnapshotDTO = {
    id:                `${userId}-${year}-${month}`,
    userId,
    year,
    month,
    totalIncome:       totalIncome.toNumber(),
    totalExpenses:     totalExpenses.toNumber(),
    totalSavings:      totalSavings.toNumber(),
    savingsRate:       savingsRate.toNumber(),
    netWorth:          null,
    categoryBreakdown: categoryBreakdown as any,
    computedAt:        new Date().toISOString(),
  };

  await prisma.monthlySnapshot.upsert({
    where:  { userId_year_month: { userId, year, month } },
    create: {
      userId,
      year,
      month,
      totalIncome:       snapshot.totalIncome,
      totalExpenses:     snapshot.totalExpenses,
      totalSavings:      snapshot.totalSavings,
      savingsRate:       snapshot.savingsRate,
      categoryBreakdown: categoryBreakdown,
    },
    update: {
      totalIncome:       snapshot.totalIncome,
      totalExpenses:     snapshot.totalExpenses,
      totalSavings:      snapshot.totalSavings,
      savingsRate:       snapshot.savingsRate,
      categoryBreakdown: categoryBreakdown,
      computedAt:        new Date(),
    },
  });

  await cacheSet(cacheKey, snapshot, CACHE_TTL.MONTHLY_SNAPSHOT);
  return snapshot;
}
