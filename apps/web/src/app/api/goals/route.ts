import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const createSchema = z.object({
  name:          z.string().min(1),
  type:          z.enum(['SAVINGS', 'DEBT_PAYOFF', 'PURCHASE', 'EMERGENCY_FUND', 'RETIREMENT', 'EDUCATION', 'TRAVEL', 'OTHER']),
  targetAmount:  z.number().positive(),
  currentAmount: z.number().min(0).default(0),
  deadline:      z.string().optional(),
  notes:         z.string().optional(),
  // Story 15.25: FinancialGoal.priority is a real column (Prisma default
  // 1) this schema never accepted, even though updateGoalSchema (already
  // imported by PATCH .../[id]) has had it all along — a goal's priority
  // could be changed after creation but never set at creation. No
  // `.default()` here on purpose: omitting it should still fall through
  // to Prisma's own column default (1), not silently change to something
  // else.
  priority:      z.number().int().min(1).max(10).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const { skip, take, page, pageSize } = parsePagination(searchParams);
    const where = { userId: session.user.id };

    const [goals, total] = await Promise.all([
      prisma.financialGoal.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.financialGoal.count({ where }),
    ]);

    return NextResponse.json({ data: goals, meta: buildPaginationMeta(total, page, pageSize) });
  } catch (error) {
    // Story 15.24: same fragility class fixed in auth/mobile (15.21) and
    // advisor/scenarios (15.23) — a transient DB error (observed live
    // multiple times this session) previously surfaced as a bare,
    // un-JSON crash instead of a graceful response.
    console.error('[goals:GET]', error);
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
        priority:      parsed.data.priority,
        status:        'ACTIVE',
      },
    });
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('[goals:POST]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
