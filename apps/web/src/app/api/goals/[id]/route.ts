import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateGoalSchema } from '@budget-pocket/shared';
import { checkMutationRateLimit } from '@/lib/rateLimit';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = await checkMutationRateLimit(session.user.id);
  if (!limit.success) return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard' }, { status: 429 });

  const { id } = await params;
  const goal = await prisma.financialGoal.findFirst({ where: { id, userId: session.user.id } });
  if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body   = await req.json();
  const parsed = updateGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }
  const { deadline, ...rest } = parsed.data;

  const updated = await prisma.financialGoal.update({
    where: { id },
    data:  {
      ...rest,
      ...(deadline ? { deadline: new Date(deadline) } : {}),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = await checkMutationRateLimit(session.user.id);
  if (!limit.success) return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard' }, { status: 429 });

  const { id } = await params;
  const goal = await prisma.financialGoal.findFirst({ where: { id, userId: session.user.id } });
  if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.financialGoal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
