import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  assetClass:   z.string(),
  name:         z.string().min(1),
  ticker:       z.string().min(1),
  quantity:     z.number().positive(),
  averageCost:  z.number().positive(),
  purchaseDate: z.string(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.portfolioItem.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
