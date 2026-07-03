import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  accountName:   z.string().min(1),
  provider:      z.enum(['WAVE', 'MTN_MONEY', 'ORANGE_MONEY', 'MANUAL']),
  accountNumber: z.string().optional(),
  balance:       z.number().default(0),
  currency:      z.enum(['XOF', 'EUR', 'USD', 'GBP']).default('XOF'),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const accounts = await prisma.linkedAccount.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
