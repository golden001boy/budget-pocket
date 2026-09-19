import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createTransactionSchema } from '@budget-pocket/shared';
import { cacheDel } from '@/lib/cache';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { readJsonBody, PayloadTooLargeError } from '@/lib/requestBody';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const { skip, take, page, pageSize } = parsePagination(searchParams);
    const category = searchParams.get('category') as any;
    const type     = searchParams.get('type')     as any;
    const from     = searchParams.get('from');
    const to       = searchParams.get('to');

    const where: any = { userId: session.user.id };
    if (category) where.category = category;
    if (type)     where.type     = type;
    if (from || to) where.date = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to   ? { lte: new Date(to)   } : {}),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({ where, orderBy: { date: 'desc' }, skip, take }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      data: transactions.map(serializeTransaction),
      meta: buildPaginationMeta(total, page, pageSize),
    });
  } catch (error) {
    // Story 15.24: same fragility class fixed in auth/mobile (15.21) and
    // advisor/scenarios (15.23) — a transient DB error (observed live
    // multiple times this session) previously surfaced as a bare,
    // un-JSON crash instead of a graceful response.
    console.error('[transactions:GET]', error);
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
    const data = createTransactionSchema.safeParse(body);
    if (!data.success) {
      return NextResponse.json({ error: 'Données invalides', details: data.error.flatten() }, { status: 400 });
    }

    const tx = await prisma.transaction.create({
      data: {
        userId:      session.user.id,
        category:    data.data.category as any,
        type:        data.data.type     as any,
        expenseType: data.data.expenseType as any,
        amount:      data.data.amount,
        currency:    (data.data.currency ?? session.user.currency) as any,
        description: data.data.description,
        merchant:    data.data.merchant,
        date:        new Date(data.data.date),
        isRecurring: data.data.isRecurring ?? false,
        budgetId:    data.data.budgetId,
        tags:        data.data.tags ?? [],
        notes:       data.data.notes,
        accountId:   data.data.accountId,
      },
    });

    // Update budget.spent if linked
    if (data.data.budgetId && data.data.type === 'EXPENSE') {
      await prisma.budget.update({
        where: { id: data.data.budgetId },
        data:  { spent: { increment: data.data.amount } },
      });
    }

    // Invalidate monthly snapshot cache
    const txDate = new Date(data.data.date);
    await cacheDel(`snapshot:${session.user.id}:${txDate.getFullYear()}:${txDate.getMonth() + 1}`);

    return NextResponse.json({ data: serializeTransaction(tx) }, { status: 201 });
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: 'Corps de requête trop volumineux' }, { status: 413 });
    }
    console.error('[transactions:POST]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

function serializeTransaction(tx: any) {
  return {
    ...tx,
    amount:   Number(tx.amount),
    date:     tx.date.toISOString(),
    createdAt: tx.createdAt.toISOString(),
    updatedAt: tx.updatedAt.toISOString(),
  };
}
