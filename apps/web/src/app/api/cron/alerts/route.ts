import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;

  const budgets = await prisma.budget.findMany({
    where: { year, month },
  });

  let alertsCreated = 0;

  for (const budget of budgets) {
    const spent  = Number(budget.spent);
    const amount = Number(budget.amount);
    if (amount <= 0) continue;

    const pct      = (spent / amount) * 100;
    const alertPct = Number(budget.alertAt ?? 80);
    if (pct < alertPct) continue;

    // Skip if we already fired an alert for this budget this month
    const existing = await prisma.alert.findFirst({
      where: {
        userId:    budget.userId,
        type:      'OVERSPEND',
        createdAt: { gte: new Date(year, month - 1, 1) },
        metadata:  { path: ['budgetId'], equals: budget.id },
      },
    });
    if (existing) continue;

    await prisma.alert.create({
      data: {
        userId:   budget.userId,
        type:     'OVERSPEND',
        title:    'Budget presque atteint',
        body:     `Votre budget ${budget.category} est à ${pct.toFixed(0)}% (${spent}/${amount} FCFA)`,
        metadata: { budgetId: budget.id, category: budget.category, pct },
      },
    });

    alertsCreated++;
  }

  // Goal completion alerts
  const goals = await prisma.financialGoal.findMany({
    where: { status: 'ACTIVE' },
  });

  for (const goal of goals) {
    if (Number(goal.currentAmount) < Number(goal.targetAmount)) continue;

    const existing = await prisma.alert.findFirst({
      where: { userId: goal.userId, type: 'GOAL_MILESTONE', metadata: { path: ['goalId'], equals: goal.id } },
    });
    if (existing) continue;

    await prisma.$transaction([
      prisma.alert.create({
        data: {
          userId:   goal.userId,
          type:     'GOAL_MILESTONE',
          title:    '🎉 Objectif atteint !',
          body:     `Félicitations ! Vous avez atteint votre objectif "${goal.name}"`,
          metadata: { goalId: goal.id },
        },
      }),
      prisma.financialGoal.update({
        where: { id: goal.id },
        data:  { status: 'COMPLETED' },
      }),
    ]);
    alertsCreated++;
  }

  return NextResponse.json({ alertsCreated });
}
