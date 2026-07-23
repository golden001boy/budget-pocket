import { generateSecureToken, hashToken } from './tokens';

// Longer-lived than password reset tokens (1h) — verification is lower
// stakes than an account-takeover-adjacent action, and a user may not check
// their inbox right after registering. 24h gives them a full day.
export const EMAIL_VERIFICATION_TOKEN_TTL_SECONDS = 24 * 60 * 60;

export function generateEmailVerificationToken(): { rawToken: string; tokenHash: string } {
  return generateSecureToken();
}

export function hashEmailVerificationToken(rawToken: string): string {
  return hashToken(rawToken);
}
