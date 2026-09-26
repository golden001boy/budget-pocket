import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/requestBody';
import { withApiRoute } from '@/lib/apiRoute';
import { z } from 'zod';

const schema = z.object({
  name:           z.string().min(1).optional(),
  currency:       z.enum(['XOF', 'EUR', 'USD', 'GBP']).optional(),
  timezone:       z.string().optional(),
  onboardingDone: z.boolean().optional(),
});

export const PATCH = withApiRoute(async (req: Request, { session }) => {
  const body   = await readJsonBody(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.user.update({
    where:  { id: session.user.id },
    data:   parsed.data as any,
    select: { id: true, name: true, email: true, currency: true, timezone: true, onboardingDone: true },
  });

  return NextResponse.json(updated);
}, { name: 'user/profile:PATCH', rateLimit: true });
