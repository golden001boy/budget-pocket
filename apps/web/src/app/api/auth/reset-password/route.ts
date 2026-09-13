import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@budget-pocket/shared';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { hashPasswordResetToken } from '@/lib/passwordReset';
import { logSensitiveAction } from '@/lib/auditLog';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    // Tokens are 256 bits of randomness — brute-forcing one is infeasible
    // regardless of rate limiting. This limit is defense in depth against a
    // misbehaving/compromised client hammering the endpoint, not the actual
    // protection against guessing (unlike the login rate limits).
    const limit = await rateLimit(`reset-password:${ip}`, 10, 60 * 60);
    if (!limit.success) {
      return NextResponse.json({ error: 'Trop de tentatives, réessayez plus tard' }, { status: 429 });
    }

    const body = await req.json();
    const data = resetPasswordSchema.safeParse(body);
    if (!data.success) {
      return NextResponse.json({ error: 'Données invalides', details: data.error.flatten() }, { status: 400 });
    }

    const tokenHash = hashPasswordResetToken(data.data.token);
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.data.password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data:  { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data:  { usedAt: new Date() },
      }),
    ]);

    logSensitiveAction({ action: 'password_reset_completed', userId: resetToken.userId, ip });

    return NextResponse.json({ data: { message: 'Mot de passe mis à jour.' } });
  } catch (error) {
    console.error('[reset-password]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
