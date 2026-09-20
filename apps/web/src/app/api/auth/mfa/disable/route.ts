import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { withApiRoute } from '@/lib/apiRoute';
import { readJsonBody } from '@/lib/requestBody';
import { verifyTotpToken, consumeRecoveryCode } from '@/lib/mfa';
import { decryptSecret } from '@/lib/mfaCrypto';
import { logSensitiveAction } from '@/lib/auditLog';
import { z } from 'zod';

// Password AND a second factor (TOTP code or a recovery code), not just
// one — disabling MFA is exactly the kind of action a stolen session
// shouldn't be able to take unilaterally.
const schema = z.object({
  password: z.string().min(1),
  token:    z.string().min(4),
});

export const POST = withApiRoute(async (req: Request, { session }) => {
  const body   = await readJsonBody(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.mfaEnabled || !user.mfaSecret) {
    return NextResponse.json({ error: 'La double authentification n\'est pas activée' }, { status: 400 });
  }

  const passwordValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!passwordValid) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 400 });
  }

  const secret = decryptSecret(user.mfaSecret);
  const totpValid = verifyTotpToken(parsed.data.token, secret);
  const recoveryMatch = totpValid ? null : await consumeRecoveryCode(parsed.data.token, user.mfaRecoveryCodes);

  if (!totpValid && !recoveryMatch) {
    logSensitiveAction({ action: 'mfa_challenge_failed', userId: user.id, email: user.email, reason: 'disable_attempt' });
    return NextResponse.json({ error: 'Code invalide' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data:  { mfaEnabled: false, mfaSecret: null, mfaRecoveryCodes: [] },
  });

  logSensitiveAction({ action: 'mfa_disabled', userId: user.id, email: user.email });

  return NextResponse.json({ data: { message: 'Double authentification désactivée.' } });
}, { name: 'auth/mfa/disable:POST', rateLimit: true });
