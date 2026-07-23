import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@budget-pocket/shared';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { generatePasswordResetToken, PASSWORD_RESET_TOKEN_TTL_SECONDS } from '@/lib/passwordReset';
import { sendPasswordResetEmail } from '@/lib/email';

// Always the same response, whether or not the email is registered — a
// different response (or a different response time, notably) would let an
// attacker enumerate which emails have accounts. See BE-01/API-01 pattern
// used elsewhere in this codebase (404 rather than 403 on object ownership).
const GENERIC_RESPONSE = NextResponse.json({
  data: { message: 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.' },
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const ipLimit = await rateLimit(`forgot-password:${ip}`, 5, 60 * 60);
    if (!ipLimit.success) {
      return NextResponse.json({ error: 'Trop de tentatives, réessayez plus tard' }, { status: 429 });
    }

    const body = await req.json();
    const data = forgotPasswordSchema.safeParse(body);
    if (!data.success) {
      return NextResponse.json({ error: 'Données invalides', details: data.error.flatten() }, { status: 400 });
    }
    const email = data.data.email.toLowerCase().trim();

    // Per-account limit too, independent of IP — stops one attacker email
    // bombing a victim's inbox from many IPs (same reasoning as story 15.8's
    // account-wide login limit).
    const emailLimit = await rateLimit(`forgot-password-email:${email}`, 3, 60 * 60);
    if (!emailLimit.success) {
      return GENERIC_RESPONSE;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return GENERIC_RESPONSE;
    }

    // Invalidate any still-outstanding tokens so only the most recent link
    // works — otherwise an old, forwarded, or leaked link stays valid.
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data:  { usedAt: new Date() },
    });

    const { rawToken, tokenHash } = generatePasswordResetToken();
    await prisma.passwordResetToken.create({
      data: {
        userId:    user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_SECONDS * 1000),
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    return GENERIC_RESPONSE;
  } catch (error) {
    console.error('[forgot-password]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
