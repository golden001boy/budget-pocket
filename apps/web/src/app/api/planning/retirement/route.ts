import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { readJsonBody, PayloadTooLargeError } from '@/lib/requestBody';
import { z } from 'zod';

// Story 15.25: `inflationRate` and `notes` are real columns on
// RetirementPlan (see prisma/schema.prisma) that this schema previously
// omitted entirely — a client could never set either through this route,
// even though a complete matching schema already existed, unused, in
// packages/shared/src/schemas/retirement.ts (that shared schema isn't
// imported directly here because its bounds/defaults diverge slightly
// from this route's already-live ones — e.g. targetRetirementAge's min
// and expectedReturnRate's default — and changing those would be a
// behavior change, not a bug fix). The cross-field check below (target
// age must exceed current age) is the one piece of real validation logic
// worth carrying over from it.
const schema = z.object({
  currentAge:          z.number().int().min(18).max(80),
  targetRetirementAge: z.number().int().min(40).max(90),
  currentSavings:      z.number().min(0),
  monthlyContribution: z.number().min(0),
  expectedReturnRate:  z.number().min(0).max(30).default(8),
  inflationRate:       z.number().min(0).max(30).default(3),
  targetMonthlyIncome: z.number().positive(),
  notes:               z.string().max(500).optional(),
}).refine(d => d.targetRetirementAge > d.currentAge, {
  message: 'L\'âge de retraite doit être supérieur à l\'âge actuel',
  path: ['targetRetirementAge'],
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const plan = await prisma.retirementPlan.findUnique({ where: { userId: session.user.id } });
    return NextResponse.json(plan);
  } catch (error) {
    // Story 15.24: same fragility class fixed in auth/mobile (15.21) and
    // advisor/scenarios (15.23) — a transient DB error (observed live
    // multiple times this session) previously surfaced as a bare,
    // un-JSON crash instead of a graceful response.
    console.error('[planning/retirement:GET]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const limit = await checkMutationRateLimit(session.user.id);
    if (!limit.success) return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard' }, { status: 429 });

    const body   = await readJsonBody(req);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const plan = await prisma.retirementPlan.upsert({
      where:  { userId: session.user.id },
      create: { userId: session.user.id, ...parsed.data },
      update: parsed.data,
    });
    return NextResponse.json(plan);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: 'Corps de requête trop volumineux' }, { status: 413 });
    }
    console.error('[planning/retirement:POST]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
