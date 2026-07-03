import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const scenarios = await prisma.scenario.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(scenarios);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
