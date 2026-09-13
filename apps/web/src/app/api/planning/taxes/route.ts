import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';
import { z } from 'zod';

const schema = z.object({
  year:    z.number().int(),
  category: z.string(),
  amount:  z.number().min(0),
  dueDate: z.string().optional(),
  notes:   z.string().optional(),
  isPaid:  z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const { skip, take, page, pageSize } = parsePagination(searchParams);
  const where = { userId: session.user.id };

  const [records, total] = await Promise.all([
    prisma.taxRecord.findMany({ where, orderBy: { year: 'desc' }, skip, take }),
    prisma.taxRecord.count({ where }),
  ]);
  return NextResponse.json({ data: records, meta: buildPaginationMeta(total, page, pageSize) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body   = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const record = await prisma.taxRecord.create({
    data: {
      userId:   session.user.id,
      year:     parsed.data.year,
      category: parsed.data.category,
      amount:   parsed.data.amount,
      dueDate:  parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      notes:    parsed.data.notes,
      isPaid:   parsed.data.isPaid,
    },
  });
  return NextResponse.json(record, { status: 201 });
}
