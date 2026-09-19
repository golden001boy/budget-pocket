import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { readJsonBody, PayloadTooLargeError } from '@/lib/requestBody';
import { createBudgetSchema } from '@budget-pocket/shared';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
  } catch (error) {
    // Story 15.24: same fragility class fixed in auth/mobile (15.21) and
    // advisor/scenarios (15.23) — a transient DB error (observed live
    // multiple times this session) previously surfaced as a bare,
    // un-JSON crash instead of a graceful response.
    console.error('[budgets:GET]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const limit = await checkMutationRateLimit(session.user.id);
    if (!limit.success) return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard' }, { status: 429 });

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
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: 'Corps de requête trop volumineux' }, { status: 413 });
    }
    console.error('[budgets:POST]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
