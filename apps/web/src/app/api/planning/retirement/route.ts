import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  currentAge:          z.number().int().min(18).max(80),
  targetRetirementAge: z.number().int().min(40).max(90),
  currentSavings:      z.number().min(0),
  monthlyContribution: z.number().min(0),
  expectedReturnRate:  z.number().min(0).max(30).default(8),
  targetMonthlyIncome: z.number().positive(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plan = await prisma.retirementPlan.findUnique({ where: { userId: session.user.id } });
  return NextResponse.json(plan);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body   = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const plan = await prisma.retirementPlan.upsert({
    where:  { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  });
  return NextResponse.json(plan);
}
