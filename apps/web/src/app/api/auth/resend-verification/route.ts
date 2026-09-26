import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';
import { generateEmailVerificationToken, EMAIL_VERIFICATION_TOKEN_TTL_SECONDS } from '@/lib/emailVerification';
import { sendVerificationEmail } from '@/lib/email';
import { logSensitiveAction } from '@/lib/auditLog';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Gated by session rather than taking an email in the body, unlike
  // forgot-password — the caller is already proven to own this account, so
  // there's no email-enumeration concern to design around here.
  const limit = await rateLimit(`resend-verification:${session.user.id}`, 3, 60 * 60);
  if (!limit.success) {
    return NextResponse.json({ error: 'Trop de tentatives, réessayez plus tard' }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (user.emailVerified) {
    return NextResponse.json({ data: { message: 'Email déjà confirmé.' } });
  }

  await prisma.emailVerificationToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data:  { usedAt: new Date() },
  });

  const { rawToken, tokenHash } = generateEmailVerificationToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId:    user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_SECONDS * 1000),
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  await sendVerificationEmail(user.email, `${baseUrl}/verify-email?token=${rawToken}`);

  logSensitiveAction({ action: 'email_verification_resent', userId: user.id, email: user.email });

  return NextResponse.json({ data: { message: 'Email de confirmation renvoyé.' } });
}
