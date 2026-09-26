import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';
import { readJsonBody } from '@/lib/requestBody';
import { withApiRoute } from '@/lib/apiRoute';
import { z } from 'zod';

// Story 15.23 (rule #5, "toute API valide ses inputs côté serveur, sans
// exception"): this route had no schema at all before. A stricter,
// per-type schema already exists in
// packages/shared/src/schemas/scenario.ts (a discriminated union with a
// typed `inputs` shape per scenario type) but it only covers 3 of the 6
// ScenarioType values this route actually accepts (REAL_ESTATE,
// EARLY_RETIREMENT, STOCK_INVESTMENT) — BUSINESS_CREATION, EDUCATION_FUND
// and CUSTOM have no defined input shape yet. Wiring that schema in as-is
// would reject three scenario types that work today, which is a product
// decision (what shape should those inputs have?), not a validation bug
// fix — flagged in 03-architecture.md §13 instead. This schema is the
// narrower, safe fix: it validates what the route already assumes
// (well-formed strings/objects) without inventing per-type shapes for
// types nobody has specified yet.
const createScenarioSchema = z.object({
  type: z.enum(['REAL_ESTATE', 'EARLY_RETIREMENT', 'STOCK_INVESTMENT', 'BUSINESS_CREATION', 'EDUCATION_FUND', 'CUSTOM']).optional(),
  name: z.string().min(1).max(200).optional(),
  inputs: z.record(z.unknown()).optional(),
  results: z.record(z.unknown()).optional(),
});

export const GET = withApiRoute(async (req: Request, { session }) => {
  const { searchParams } = new URL(req.url);
  const { skip, take, page, pageSize } = parsePagination(searchParams);
  const where = { userId: session.user.id };

  const [scenarios, total] = await Promise.all([
    prisma.scenario.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.scenario.count({ where }),
  ]);
  return NextResponse.json({ data: scenarios, meta: buildPaginationMeta(total, page, pageSize) });
}, { name: 'advisor/scenarios:GET' });

export const POST = withApiRoute(async (req: Request, { session }) => {
  const body = await readJsonBody(req);
  const parsed = createScenarioSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { type, name, inputs, results } = parsed.data;

  // Same fallback as before this story: an unrecognized/missing type
  // becomes CUSTOM rather than a rejection — `type` is already
  // constrained to the 6 known values by the schema above, so this only
  // covers the "omitted" case now, not an arbitrary string.
  const scenarioType = type ?? 'CUSTOM';

  const scenario = await prisma.scenario.create({
    data: {
      userId:     session.user.id,
      type:       scenarioType as any,
      name:       name ?? `Scénario ${scenarioType}`,
      inputs:     (inputs ?? {}) as any,
      results:    (results ?? {}) as any,
      computedAt: new Date(),
    },
  });
  return NextResponse.json(scenario, { status: 201 });
}, { name: 'advisor/scenarios:POST', rateLimit: true });
