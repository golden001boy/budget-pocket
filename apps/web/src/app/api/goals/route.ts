import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  name:          z.string().min(1),
  type:          z.enum(['SAVINGS', 'DEBT_PAYOFF', 'PURCHASE', 'EMERGENCY_FUND', 'RETIREMENT', 'EDUCATION', 'TRAVEL', 'OTHER']),
  targetAmount:  z.number().positive(),
  currentAmount: z.number().min(0).default(0),
  deadline:      z.string().optional(),
  notes:         z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const goals = await prisma.financialGoal.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body   = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const goal = await prisma.financialGoal.create({
    data: {
      userId:        session.user.id,
      name:          parsed.data.name,
      type:          parsed.data.type,
      targetAmount:  parsed.data.targetAmount,
      currentAmount: parsed.data.currentAmount,
      deadline:      parsed.data.deadline ? new Date(parsed.data.deadline) : undefined,
      notes:         parsed.data.notes,
      status:        'ACTIVE',
    },
  });
  return NextResponse.json(goal, { status: 201 });
}
