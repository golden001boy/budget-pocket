import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeMonthlySnapshot } from '@/lib/analytics/snapshot';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;

  // Also recompute previous month on the 1st of each month (covers the full previous period)
  const prevDate  = new Date(year, now.getMonth() - 1, 1);
  const prevYear  = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth() + 1;

  const users = await prisma.user.findMany({ select: { id: true } });

  let computed = 0;
  await Promise.allSettled(
    users.flatMap((u) => [
      computeMonthlySnapshot(u.id, year, month),
      now.getDate() <= 3 ? computeMonthlySnapshot(u.id, prevYear, prevMonth) : Promise.resolve(null),
    ]),
  );
  computed = users.length;

  return NextResponse.json({ computed, year, month });
}
