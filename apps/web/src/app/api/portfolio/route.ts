import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const createSchema = z.object({
  assetClass:   z.string(),
  name:         z.string().min(1),
  ticker:       z.string().min(1),
  quantity:     z.number().positive(),
  averageCost:  z.number().positive(),
  purchaseDate: z.string(),
});

export async function GET(req: NextRequest) {
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
}

export async function POST(req: NextRequest) {
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
      assetClass:   parsed.data.assetClass as any,
      name:         parsed.data.name,
      ticker:       parsed.data.ticker,
      quantity:     parsed.data.quantity,
      averageCost:  parsed.data.averageCost,
      purchaseDate: new Date(parsed.data.purchaseDate),
    },
  });
  return NextResponse.json(item, { status: 201 });
}
