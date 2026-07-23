import { randomBytes, createHash } from 'crypto';

export const PASSWORD_RESET_TOKEN_TTL_SECONDS = 60 * 60; // 1h

/**
 * Only the hash is ever stored — the raw token lives solely in the emailed
 * link. If the database leaked, stored hashes alone can't be replayed to
 * reset an account (same reasoning as bcrypt for login passwords, just a
 * single fast hash here since the token itself is already 256 bits of
 * randomness, not a low-entropy human password).
 */
export function generatePasswordResetToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(32).toString('hex');
  return { rawToken, tokenHash: hashPasswordResetToken(rawToken) };
}

export function hashPasswordResetToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
