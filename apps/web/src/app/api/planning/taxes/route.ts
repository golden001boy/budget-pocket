import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';
import { readJsonBody } from '@/lib/requestBody';
import { withApiRoute } from '@/lib/apiRoute';
import { z } from 'zod';

const schema = z.object({
  year:    z.number().int(),
  category: z.string(),
  amount:  z.number().min(0),
  dueDate: z.string().optional(),
  notes:   z.string().optional(),
  isPaid:  z.boolean().default(false),
});

export const GET = withApiRoute(async (req: Request, { session }) => {
  const { searchParams } = new URL(req.url);
  const { skip, take, page, pageSize } = parsePagination(searchParams);
  const where = { userId: session.user.id };

  const [records, total] = await Promise.all([
    prisma.taxRecord.findMany({ where, orderBy: { year: 'desc' }, skip, take }),
    prisma.taxRecord.count({ where }),
  ]);
  return NextResponse.json({ data: records, meta: buildPaginationMeta(total, page, pageSize) });
}, { name: 'planning/taxes:GET' });

export const POST = withApiRoute(async (req: Request, { session }) => {
  const body   = await readJsonBody(req);
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
}, { name: 'planning/taxes:POST', rateLimit: true });
