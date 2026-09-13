import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

// Story 15.25: tightened from the original `z.string()` on `assetClass`
// (any string reached Prisma, which would only reject it with a raw
// enum-mismatch error at the DB layer — now caught earlier as a clear
// 400) and `purchaseDate` (any string reached `new Date(...)`, which
// silently produces an Invalid Date for garbage input instead of
// rejecting it). Also adds `exchange`/`notes` — both real columns on
// PortfolioItem (see prisma/schema.prisma) that this schema never
// accepted, even though a matching schema already existed, unused, in
// packages/shared/src/schemas/portfolio.ts.
const createSchema = z.object({
  assetClass:   z.enum(['STOCK_BRVM', 'STOCK_INTL', 'CRYPTO', 'REAL_ESTATE', 'BOND', 'SAVINGS_ACCOUNT', 'OTHER']),
  name:         z.string().min(1),
  ticker:       z.string().min(1),
  exchange:     z.string().max(50).optional(),
  quantity:     z.number().positive(),
  averageCost:  z.number().positive(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : AAAA-MM-JJ'),
  notes:        z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const { skip, take, page, pageSize } = parsePagination(searchParams);
    const where = { userId: session.user.id };

    const [items, total] = await Promise.all([
      prisma.portfolioItem.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.portfolioItem.count({ where }),
    ]);

    return NextResponse.json({ data: items, meta: buildPaginationMeta(total, page, pageSize) });
  } catch (error) {
    // Story 15.24: same fragility class fixed in auth/mobile (15.21) and
    // advisor/scenarios (15.23) — a transient DB error (observed live
    // multiple times this session) previously surfaced as a bare,
    // un-JSON crash instead of a graceful response.
    console.error('[portfolio:GET]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const limit = await checkMutationRateLimit(session.user.id);
    if (!limit.success) return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard' }, { status: 429 });

    const body   = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const item = await prisma.portfolioItem.create({
      data: {
        userId:       session.user.id,
        assetClass:   parsed.data.assetClass,
        name:         parsed.data.name,
        ticker:       parsed.data.ticker,
        exchange:     parsed.data.exchange,
        quantity:     parsed.data.quantity,
        averageCost:  parsed.data.averageCost,
        purchaseDate: new Date(parsed.data.purchaseDate),
        notes:        parsed.data.notes,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('[portfolio:POST]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
