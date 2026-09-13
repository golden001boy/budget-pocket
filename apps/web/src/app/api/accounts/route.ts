import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const createSchema = z.object({
  accountName:   z.string().min(1),
  provider:      z.enum(['WAVE', 'MTN_MONEY', 'ORANGE_MONEY', 'MANUAL']),
  accountNumber: z.string().optional(),
  balance:       z.number().default(0),
  currency:      z.enum(['XOF', 'EUR', 'USD', 'GBP']).default('XOF'),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const { skip, take, page, pageSize } = parsePagination(searchParams);
  const where = { userId: session.user.id };

  const [accounts, total] = await Promise.all([
    prisma.linkedAccount.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.linkedAccount.count({ where }),
  ]);

  return NextResponse.json({ data: accounts, meta: buildPaginationMeta(total, page, pageSize) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = await checkMutationRateLimit(session.user.id);
  if (!limit.success) return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard' }, { status: 429 });

  const body   = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const account = await prisma.linkedAccount.create({
    data: {
      userId:        session.user.id,
      accountName:   parsed.data.accountName,
      provider:      parsed.data.provider,
      accountNumber: parsed.data.accountNumber,
      balance:       parsed.data.balance,
      currency:      parsed.data.currency,
      isActive:      true,
    },
  });
  return NextResponse.json(account, { status: 201 });
}
