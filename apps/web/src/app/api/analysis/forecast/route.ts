import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { projectForecast } from '@/lib/analytics/forecast';
import { cacheGetOrSet, CACHE_TTL } from '@/lib/cache';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const months = Math.min(
      parseInt(searchParams.get('months') ?? '6', 10),
      session.user.role === 'PREMIUM' || session.user.role === 'ADMIN' ? 12 : 3,
    );

    const key = `forecast:${session.user.id}:${months}`;
    const result = await cacheGetOrSet(key, async () => {
      const snapshots = await prisma.monthlySnapshot.findMany({
        where:   { userId: session.user.id },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        take:    12,
      });

      const serialized = snapshots.map(s => ({
        id:                s.id,
        userId:            s.userId,
        year:              s.year,
        month:             s.month,
        totalIncome:       Number(s.totalIncome),
        totalExpenses:     Number(s.totalExpenses),
        totalSavings:      Number(s.totalSavings),
        savingsRate:       Number(s.savingsRate),
        netWorth:          s.netWorth ? Number(s.netWorth) : null,
        categoryBreakdown: s.categoryBreakdown as any,
        computedAt:        s.computedAt.toISOString(),
      }));

      return projectForecast(serialized, months);
    }, CACHE_TTL.FORECAST);

    return NextResponse.json({ data: result });
  } catch (error) {
    // Story 15.24: same fragility class fixed across the rest of the API.
    console.error('[analysis/forecast:GET]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
