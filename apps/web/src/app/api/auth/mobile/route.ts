import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encode } from 'next-auth/jwt';
import { loginSchema } from '@budget-pocket/shared';
import { rateLimit, getClientIp, loginRateLimitKey, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_SECONDS } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const body   = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const ip = getClientIp(req.headers);
  const limit = await rateLimit(loginRateLimitKey(email, ip), LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_SECONDS);
  if (!limit.success) {
    return NextResponse.json({ error: 'Trop de tentatives, réessayez plus tard' }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
  }

  const token = await encode({
    token: {
      sub:            user.id,
      id:             user.id,
      name:           user.name,
      email:          user.email,
      role:           user.role,
      currency:       user.currency,
      onboardingDone: user.onboardingDone,
    },
    secret:  process.env.NEXTAUTH_SECRET!,
    maxAge:  30 * 24 * 60 * 60, // 30 jours
  });

  return NextResponse.json({
    token,
    user: {
      id:             user.id,
      name:           user.name,
      email:          user.email,
      role:           user.role,
      currency:       user.currency,
      onboardingDone: user.onboardingDone,
    },
  });
}
