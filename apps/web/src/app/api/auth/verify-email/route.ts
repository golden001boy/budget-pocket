import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyEmailSchema } from '@budget-pocket/shared';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { hashEmailVerificationToken } from '@/lib/emailVerification';
import { logSensitiveAction } from '@/lib/auditLog';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    // Same reasoning as reset-password's rate limit: the token itself is
    // 256 bits of randomness (infeasible to brute-force), this is defense
    // in depth against a misbehaving client, not the real protection.
    const limit = await rateLimit(`verify-email:${ip}`, 10, 60 * 60);
    if (!limit.success) {
      return NextResponse.json({ error: 'Trop de tentatives, réessayez plus tard' }, { status: 429 });
    }

    const body = await req.json();
    const data = verifyEmailSchema.safeParse(body);
    if (!data.success) {
      return NextResponse.json({ error: 'Données invalides', details: data.error.flatten() }, { status: 400 });
    }

    const tokenHash = hashEmailVerificationToken(data.data.token);
    const verificationToken = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

    if (!verificationToken || verificationToken.usedAt || verificationToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data:  { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data:  { usedAt: new Date() },
      }),
    ]);

    logSensitiveAction({ action: 'email_verified', userId: verificationToken.userId, ip });

    return NextResponse.json({ data: { message: 'Email confirmé.' } });
  } catch (error) {
    console.error('[verify-email]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
