import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();

  const rules = await prisma.recurringRule.findMany({
    where: { isActive: true, nextRunAt: { lte: today } },
  });

  let created = 0;
  for (const rule of rules) {
    await prisma.transaction.create({
      data: {
        userId:   rule.userId,
        type:     'EXPENSE',
        amount:   rule.amount,
        category: rule.category,
        date:     today,
      },
    });

    // Advance nextRunAt by 1 month, preserving the configured day of month
    const next = rule.nextRunAt ? new Date(rule.nextRunAt) : new Date(today);
    next.setMonth(next.getMonth() + 1);
    next.setDate(rule.dayOfMonth);

    await prisma.recurringRule.update({
      where: { id: rule.id },
      data:  { nextRunAt: next, lastRunAt: today },
    });

    created++;
  }

  return NextResponse.json({ processed: rules.length, created });
}
