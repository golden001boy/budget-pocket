import { randomBytes, createHash } from 'crypto';

/**
 * Shared by password reset (story 15.11) and email verification (story
 * 15.12) — both need a random, single-use, hashable token. Only the hash
 * is ever stored; the raw token lives solely in the emailed link. If the
 * database leaked, stored hashes alone can't be replayed (same reasoning
 * as bcrypt for login passwords, just a single fast hash here since the
 * token itself is already 256 bits of randomness, not a low-entropy human
 * password).
 */
export function generateSecureToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(32).toString('hex');
  return { rawToken, tokenHash: hashToken(rawToken) };
}

export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
