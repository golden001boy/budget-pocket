import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';
import { readJsonBody } from '@/lib/requestBody';
import { withApiRoute } from '@/lib/apiRoute';
import { createBudgetSchema } from '@budget-pocket/shared';

export const GET = withApiRoute(async (req: Request, { session }) => {
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1), 10);
  const year  = parseInt(searchParams.get('year')  ?? String(new Date().getFullYear()),  10);
  const { skip, take, page, pageSize } = parsePagination(searchParams);
  const where = { userId: session.user.id, month, year };

  const [budgets, total] = await Promise.all([
    prisma.budget.findMany({ where, orderBy: { category: 'asc' }, skip, take }),
    prisma.budget.count({ where }),
  ]);

  return NextResponse.json({
    data: budgets.map(b => ({
      ...b,
      amount:   Number(b.amount),
      spent:    Number(b.spent),
      alertAt:  b.alertAt ? Number(b.alertAt) : null,
    })),
    meta: buildPaginationMeta(total, page, pageSize),
  });
}, { name: 'budgets:GET' });

export const POST = withApiRoute(async (req: Request, { session }) => {
  const body = await readJsonBody(req);
  const data = createBudgetSchema.safeParse(body);
  if (!data.success) {
    return NextResponse.json({ error: 'Données invalides', details: data.error.flatten() }, { status: 400 });
  }

  const budget = await prisma.budget.upsert({
    where: {
      userId_category_month_year: {
        userId:   session.user.id,
        category: data.data.category as any,
        month:    data.data.month,
        year:     data.data.year,
      },
    },
    create: {
      userId:   session.user.id,
      category: data.data.category as any,
      amount:   data.data.amount,
      currency: (data.data.currency ?? session.user.currency) as any,
      month:    data.data.month,
      year:     data.data.year,
      alertAt:  data.data.alertAt ?? 80,
    },
    update: {
      amount:  data.data.amount,
      alertAt: data.data.alertAt ?? 80,
    },
  });

  return NextResponse.json({
    data: { ...budget, amount: Number(budget.amount), spent: Number(budget.spent), alertAt: Number(budget.alertAt) },
  }, { status: 201 });
}, { name: 'budgets:POST', rateLimit: true });
