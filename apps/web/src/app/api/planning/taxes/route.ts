import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';
import { checkMutationRateLimit } from '@/lib/rateLimit';
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
  try {
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
  } catch (error) {
    // Story 15.24: same fragility class fixed in auth/mobile (15.21) and
    // advisor/scenarios (15.23) — a transient DB error (observed live
    // multiple times this session) previously surfaced as a bare,
    // un-JSON crash instead of a graceful response.
    console.error('[planning/taxes:GET]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const limit = await checkMutationRateLimit(session.user.id);
    if (!limit.success) return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard' }, { status: 429 });

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
  } catch (error) {
    console.error('[planning/taxes:POST]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
