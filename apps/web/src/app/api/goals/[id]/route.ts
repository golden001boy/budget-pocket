import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateGoalSchema } from '@budget-pocket/shared';
import { readJsonBody } from '@/lib/requestBody';
import { withDynamicApiRoute } from '@/lib/apiRoute';

export const PATCH = withDynamicApiRoute<{ id: string }>(async (req: Request, { session, params }) => {
  const { id } = params;
  const goal = await prisma.financialGoal.findFirst({ where: { id, userId: session.user.id } });
  if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body   = await readJsonBody(req);
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
}, { name: 'goals/[id]:PATCH', rateLimit: true });

export const DELETE = withDynamicApiRoute<{ id: string }>(async (_req: Request, { session, params }) => {
  const { id } = params;
  const goal = await prisma.financialGoal.findFirst({ where: { id, userId: session.user.id } });
  if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.financialGoal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}, { name: 'goals/[id]:DELETE', rateLimit: true });
