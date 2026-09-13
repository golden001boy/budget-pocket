import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';
import { checkMutationRateLimit } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const { skip, take, page, pageSize } = parsePagination(searchParams);
  const where = { userId: session.user.id };

  const [scenarios, total] = await Promise.all([
    prisma.scenario.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.scenario.count({ where }),
  ]);
  return NextResponse.json({ data: scenarios, meta: buildPaginationMeta(total, page, pageSize) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = await checkMutationRateLimit(session.user.id);
  if (!limit.success) return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard' }, { status: 429 });

  const { type, name, inputs, results } = await req.json();

  const VALID_TYPES = ['REAL_ESTATE', 'EARLY_RETIREMENT', 'STOCK_INVESTMENT', 'BUSINESS_CREATION', 'EDUCATION_FUND', 'CUSTOM'];
  const scenarioType = VALID_TYPES.includes(type) ? type : 'CUSTOM';

  const scenario = await prisma.scenario.create({
    data: {
      userId:     session.user.id,
      type:       scenarioType as any,
      name:       name ?? `Scénario ${scenarioType}`,
      inputs:     inputs ?? {},
      results:    results ?? {},
      computedAt: new Date(),
    },
  });
  return NextResponse.json(scenario, { status: 201 });
}
