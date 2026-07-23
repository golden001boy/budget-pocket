import { generateSecureToken, hashToken } from './tokens';

export const PASSWORD_RESET_TOKEN_TTL_SECONDS = 60 * 60; // 1h

export function generatePasswordResetToken(): { rawToken: string; tokenHash: string } {
  return generateSecureToken();
}

export function hashPasswordResetToken(rawToken: string): string {
  return hashToken(rawToken);
}
