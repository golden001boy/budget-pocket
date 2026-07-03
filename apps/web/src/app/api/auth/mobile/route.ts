import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encode } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
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
