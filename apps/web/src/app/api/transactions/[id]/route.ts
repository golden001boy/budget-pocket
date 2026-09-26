import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateTransactionSchema } from '@budget-pocket/shared';
import { cacheDel } from '@/lib/cache';
import { readJsonBody } from '@/lib/requestBody';
import { withDynamicApiRoute } from '@/lib/apiRoute';

export const GET = withDynamicApiRoute<{ id: string }>(async (_req: Request, { session, params }) => {
  const { id } = params;
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx || tx.userId !== session.user.id) {
    return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  }
  return NextResponse.json({ data: serializeTx(tx) });
}, { name: 'transactions/[id]:GET' });

export const PATCH = withDynamicApiRoute<{ id: string }>(async (req: Request, { session, params }) => {
  const { id } = params;
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx || tx.userId !== session.user.id) {
    return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  }

  const body = await readJsonBody(req);
  const data = updateTransactionSchema.safeParse(body);
  if (!data.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data:  {
      ...(data.data.category   ? { category:    data.data.category   as any } : {}),
      ...(data.data.type       ? { type:        data.data.type       as any } : {}),
      ...(data.data.expenseType ? { expenseType: data.data.expenseType as any } : {}),
      ...(data.data.amount     !== undefined ? { amount: data.data.amount } : {}),
      ...(data.data.description !== undefined ? { description: data.data.description } : {}),
      ...(data.data.merchant   !== undefined ? { merchant:    data.data.merchant   } : {}),
      ...(data.data.date       ? { date: new Date(data.data.date) } : {}),
      ...(data.data.notes      !== undefined ? { notes: data.data.notes } : {}),
      ...(data.data.tags       !== undefined ? { tags:  data.data.tags  } : {}),
    },
  });

  await cacheDel(`snapshot:${session.user.id}:${tx.date.getFullYear()}:${tx.date.getMonth() + 1}`);
  return NextResponse.json({ data: serializeTx(updated) });
}, { name: 'transactions/[id]:PATCH', rateLimit: true });

export const DELETE = withDynamicApiRoute<{ id: string }>(async (_req: Request, { session, params }) => {
  const { id } = params;
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx || tx.userId !== session.user.id) {
    return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  }

  await prisma.transaction.delete({ where: { id } });
  await cacheDel(`snapshot:${session.user.id}:${tx.date.getFullYear()}:${tx.date.getMonth() + 1}`);
  return new Response(null, { status: 204 });
}, { name: 'transactions/[id]:DELETE', rateLimit: true });

function serializeTx(tx: any) {
  return {
    ...tx,
    amount:    Number(tx.amount),
    date:      tx.date.toISOString(),
    createdAt: tx.createdAt.toISOString(),
    updatedAt: tx.updatedAt.toISOString(),
  };
}
