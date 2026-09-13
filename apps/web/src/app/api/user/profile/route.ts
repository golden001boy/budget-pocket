import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const schema = z.object({
  name:           z.string().min(1).optional(),
  currency:       z.enum(['XOF', 'EUR', 'USD', 'GBP']).optional(),
  timezone:       z.string().optional(),
  onboardingDone: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const limit = await checkMutationRateLimit(session.user.id);
    if (!limit.success) return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard' }, { status: 429 });

    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const updated = await prisma.user.update({
      where:  { id: session.user.id },
      data:   parsed.data as any,
      select: { id: true, name: true, email: true, currency: true, timezone: true, onboardingDone: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    // Story 15.24: same fragility class fixed in auth/mobile (15.21) and
    // advisor/scenarios (15.23) — a transient DB error (observed live
    // multiple times this session) previously surfaced as a bare,
    // un-JSON crash instead of a graceful response.
    console.error('[user/profile:PATCH]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
