import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/requestBody';
import { withApiRoute } from '@/lib/apiRoute';
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

export const GET = withApiRoute(async (_req: Request, { session }) => {
  const plan = await prisma.retirementPlan.findUnique({ where: { userId: session.user.id } });
  return NextResponse.json(plan);
}, { name: 'planning/retirement:GET' });

export const POST = withApiRoute(async (req: Request, { session }) => {
  const body   = await readJsonBody(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const plan = await prisma.retirementPlan.upsert({
    where:  { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  });
  return NextResponse.json(plan);
}, { name: 'planning/retirement:POST', rateLimit: true });
