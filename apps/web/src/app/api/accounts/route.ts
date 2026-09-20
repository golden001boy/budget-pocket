import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';
import { readJsonBody } from '@/lib/requestBody';
import { withApiRoute } from '@/lib/apiRoute';
import { z } from 'zod';

const createSchema = z.object({
  accountName:   z.string().min(1),
  provider:      z.enum(['WAVE', 'MTN_MONEY', 'ORANGE_MONEY', 'MANUAL']),
  accountNumber: z.string().optional(),
  balance:       z.number().default(0),
  currency:      z.enum(['XOF', 'EUR', 'USD', 'GBP']).default('XOF'),
});

export const GET = withApiRoute(async (req: Request, { session }) => {
  const { searchParams } = new URL(req.url);
  const { skip, take, page, pageSize } = parsePagination(searchParams);
  const where = { userId: session.user.id };

  const [accounts, total] = await Promise.all([
    prisma.linkedAccount.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.linkedAccount.count({ where }),
  ]);

  return NextResponse.json({ data: accounts, meta: buildPaginationMeta(total, page, pageSize) });
}, { name: 'accounts:GET' });

export const POST = withApiRoute(async (req: Request, { session }) => {
  const body   = await readJsonBody(req);
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
}, { name: 'accounts:POST', rateLimit: true });
