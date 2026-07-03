import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const goal = await prisma.financialGoal.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body    = await req.json();
  const updated = await prisma.financialGoal.update({
    where: { id: params.id },
    data:  {
      name:          body.name,
      targetAmount:  body.targetAmount,
      currentAmount: body.currentAmount,
      deadline:      body.deadline ? new Date(body.deadline) : undefined,
      notes:         body.notes,
      status:        body.status,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const goal = await prisma.financialGoal.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.financialGoal.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
