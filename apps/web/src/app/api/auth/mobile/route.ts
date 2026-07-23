import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encode } from 'next-auth/jwt';
import { loginSchema } from '@budget-pocket/shared';
import {
  rateLimit, getClientIp, loginRateLimitKey, accountLoginRateLimitKey,
  LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_SECONDS, ACCOUNT_LOGIN_ATTEMPT_LIMIT,
} from '@/lib/rateLimit';

// Kept in sync with SESSION_MAX_AGE_SECONDS in lib/auth.ts (story 15.8) — the
// mobile client stores this token directly and has no refresh flow, so it
// simply expires and the user re-logs in weekly instead of monthly.
const MOBILE_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

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

  const accountLimit = await rateLimit(accountLoginRateLimitKey(email), ACCOUNT_LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_SECONDS);
  if (!accountLimit.success) {
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
    maxAge:  MOBILE_TOKEN_MAX_AGE_SECONDS,
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
