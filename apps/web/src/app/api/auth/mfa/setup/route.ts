import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiRoute } from '@/lib/apiRoute';
import { generateTotpSecret, generateQrCodeDataUrl } from '@/lib/mfa';
import { encryptSecret } from '@/lib/mfaCrypto';

// Story 15.32 (ADR-008 residual, MFA — optional, user-activated TOTP).
// Generates a new secret and stores it encrypted, but leaves mfaEnabled
// false until POST /api/auth/mfa/enable confirms the user actually scanned
// it and can produce a valid code — otherwise a user who abandons the setup
// flow midway would get locked into a secret they never confirmed.
export const POST = withApiRoute(async (_req: Request, { session }) => {
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });

  if (user.mfaEnabled) {
    return NextResponse.json({ error: 'La double authentification est déjà activée' }, { status: 400 });
  }

  const secret = generateTotpSecret();
  const qrCodeDataUrl = await generateQrCodeDataUrl(user.email, secret);

  await prisma.user.update({
    where: { id: user.id },
    data:  { mfaSecret: encryptSecret(secret) },
  });

  return NextResponse.json({ data: { secret, qrCodeDataUrl } });
}, { name: 'auth/mfa/setup:POST', rateLimit: true });
