import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateTransactionSchema } from '@budget-pocket/shared';
import { cacheDel } from '@/lib/cache';
import { checkMutationRateLimit } from '@/lib/rateLimit';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx || tx.userId !== session.user.id) {
    return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  }
  return NextResponse.json({ data: serializeTx(tx) });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const limit = await checkMutationRateLimit(session.user.id);
  if (!limit.success) return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard' }, { status: 429 });

  const { id } = await params;
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx || tx.userId !== session.user.id) {
    return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  }

  const body = await req.json();
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
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const limit = await checkMutationRateLimit(session.user.id);
  if (!limit.success) return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard' }, { status: 429 });

  const { id } = await params;
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx || tx.userId !== session.user.id) {
    return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  }

  await prisma.transaction.delete({ where: { id } });
  await cacheDel(`snapshot:${session.user.id}:${tx.date.getFullYear()}:${tx.date.getMonth() + 1}`);
  return new Response(null, { status: 204 });
}

function serializeTx(tx: any) {
  return {
    ...tx,
    amount:    Number(tx.amount),
    date:      tx.date.toISOString(),
    createdAt: tx.createdAt.toISOString(),
    updatedAt: tx.updatedAt.toISOString(),
  };
}
